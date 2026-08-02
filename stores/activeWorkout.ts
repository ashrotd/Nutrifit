import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { useAppStore } from './useAppStore'
import {
  ActiveWorkoutSession,
  ActiveExercise,
  ActiveSet,
  ExerciseCatalogItem,
} from '@/types/workout'

const DEFAULT_REST_SECONDS = 90

// Client-generated row ids (used for both React keys and the actual
// Postgres primary key) so syncToSupabase can always `upsert` — no
// insert-then-swap-the-id dance needed for the offline-first flow.
// Math.random is fine here: these are just row identifiers, not secrets.
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface ActiveWorkoutState {
  session: ActiveWorkoutSession | null
  isSyncing: boolean

  startWorkout: (name?: string) => void
  discardWorkout: () => void
  setNotes: (notes: string) => void

  addExercise: (exercise: ExerciseCatalogItem) => string
  removeExercise: (exerciseId: string) => void
  setRestSeconds: (exerciseId: string, seconds: number) => void

  addSet: (exerciseId: string) => void
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<Pick<ActiveSet, 'weight' | 'reps' | 'rpe' | 'isWarmup'>>
  ) => void
  toggleSetComplete: (exerciseId: string, setId: string) => void
  removeSet: (exerciseId: string, setId: string) => void

  syncToSupabase: () => Promise<void>
  finishWorkout: () => Promise<string | null>
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      session: null,
      isSyncing: false,

      startWorkout: (name = 'Workout') => {
        set({
          session: {
            id: generateId(),
            name,
            startedAt: new Date().toISOString(),
            endedAt: null,
            notes: '',
            exercises: [],
            lastSyncedAt: null,
          },
        })
      },

      discardWorkout: () => set({ session: null }),

      setNotes: (notes) => {
        const { session } = get()
        if (!session) return
        set({ session: { ...session, notes } })
      },

      addExercise: (exercise) => {
        const { session } = get()
        if (!session) return ''
        const newExercise: ActiveExercise = {
          id: generateId(),
          exerciseId: exercise.id,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          orderIndex: session.exercises.length,
          restSeconds: DEFAULT_REST_SECONDS,
          sets: [],
        }
        set({ session: { ...session, exercises: [...session.exercises, newExercise] } })
        return newExercise.id
      },

      removeExercise: (exerciseId) => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            exercises: session.exercises
              .filter((e) => e.id !== exerciseId)
              .map((e, i) => ({ ...e, orderIndex: i })),
          },
        })
      },

      setRestSeconds: (exerciseId, seconds) => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            exercises: session.exercises.map((e) =>
              e.id === exerciseId ? { ...e, restSeconds: Math.max(0, seconds) } : e
            ),
          },
        })
      },

      addSet: (exerciseId) => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            exercises: session.exercises.map((e) => {
              if (e.id !== exerciseId) return e
              const lastSet = e.sets[e.sets.length - 1]
              const newSet: ActiveSet = {
                id: generateId(),
                setNumber: e.sets.length + 1,
                weight: lastSet?.weight ?? 0,
                reps: lastSet?.reps ?? 0,
                rpe: null,
                isWarmup: false,
                completed: false,
              }
              return { ...e, sets: [...e.sets, newSet] }
            }),
          },
        })
      },

      updateSet: (exerciseId, setId, patch) => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            exercises: session.exercises.map((e) =>
              e.id !== exerciseId
                ? e
                : { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
            ),
          },
        })
      },

      toggleSetComplete: (exerciseId, setId) => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            exercises: session.exercises.map((e) =>
              e.id !== exerciseId
                ? e
                : {
                    ...e,
                    sets: e.sets.map((s) =>
                      s.id === setId ? { ...s, completed: !s.completed } : s
                    ),
                  }
            ),
          },
        })
      },

      removeSet: (exerciseId, setId) => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            exercises: session.exercises.map((e) =>
              e.id !== exerciseId
                ? e
                : {
                    ...e,
                    sets: e.sets
                      .filter((s) => s.id !== setId)
                      .map((s, i) => ({ ...s, setNumber: i + 1 })),
                  }
            ),
          },
        })
      },

      // Batch-syncs the whole session to Supabase via upsert (id is
      // client-generated, so this is safe to call repeatedly — first call
      // inserts, later calls update the same rows). Call on an interval
      // (e.g. every 30s) from the active workout screen, not per keystroke.
      syncToSupabase: async () => {
        const { session, isSyncing } = get()
        if (!session || isSyncing) return
        const userId = useAppStore.getState().user?.id
        if (!userId) return

        set({ isSyncing: true })
        try {
          const { error: workoutError } = await supabase.from('workout_logs').upsert({
            id: session.id,
            user_id: userId,
            name: session.name,
            started_at: session.startedAt,
            ended_at: session.endedAt,
            notes: session.notes,
          })
          if (workoutError) throw workoutError

          if (session.exercises.length > 0) {
            const { error: exercisesError } = await supabase.from('workout_exercises').upsert(
              session.exercises.map((e) => ({
                id: e.id,
                workout_log_id: session.id,
                exercise_id: e.exerciseId,
                order_index: e.orderIndex,
                rest_seconds: e.restSeconds,
              }))
            )
            if (exercisesError) throw exercisesError

            const allSets = session.exercises.flatMap((e) =>
              e.sets.map((s) => ({
                id: s.id,
                workout_exercise_id: e.id,
                workout_log_id: session.id,
                exercise_id: e.exerciseId,
                exercise_name: e.name,
                muscle_group: e.muscleGroup,
                set_number: s.setNumber,
                weight: s.weight,
                reps: s.reps,
                rpe: s.rpe,
                is_warmup: s.isWarmup,
                completed: s.completed,
              }))
            )
            if (allSets.length > 0) {
              const { error: setsError } = await supabase.from('set_logs').upsert(allSets)
              if (setsError) throw setsError
            }
          }

          set((state) =>
            state.session
              ? { session: { ...state.session, lastSyncedAt: new Date().toISOString() } }
              : {}
          )
        } catch (error) {
          console.error('Error syncing active workout:', error)
        } finally {
          set({ isSyncing: false })
        }
      },

      // Computes total volume from completed, non-warmup sets, writes
      // ended_at/total_volume/duration, does a final sync, then clears
      // the local session. Returns the workout id for the summary route.
      finishWorkout: async () => {
        const { session } = get()
        if (!session) return null

        const totalVolume = session.exercises.reduce(
          (sum, e) =>
            sum +
            e.sets
              .filter((s) => s.completed && !s.isWarmup)
              .reduce((setSum, s) => setSum + s.weight * s.reps, 0),
          0
        )

        const endedAt = new Date().toISOString()
        const finishedSession: ActiveWorkoutSession = { ...session, endedAt }
        set({ session: finishedSession })

        const userId = useAppStore.getState().user?.id
        if (!userId) return null

        await get().syncToSupabase()

        const durationMinutes = Math.round(
          (new Date(endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000
        )

        const { error } = await supabase
          .from('workout_logs')
          .update({
            ended_at: endedAt,
            total_volume: totalVolume,
            duration_minutes: durationMinutes,
          })
          .eq('id', session.id)

        if (error) {
          console.error('Error finishing workout:', error)
          return null
        }

        const finishedId = session.id
        set({ session: null })
        return finishedId
      },
    }),
    {
      name: 'nutriarc-active-workout',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
