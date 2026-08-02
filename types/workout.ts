import { MuscleGroup, Equipment } from './index'

export interface ExerciseCatalogItem {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: Equipment
  instructions: string | null
  isCustom: boolean
  userId: string | null
}

export interface ActiveSet {
  id: string
  setNumber: number
  weight: number // kg
  reps: number
  rpe: number | null
  isWarmup: boolean
  completed: boolean
}

export interface ActiveExercise {
  id: string
  exerciseId: string // ExerciseCatalogItem.id
  name: string
  muscleGroup: MuscleGroup
  equipment: Equipment
  orderIndex: number
  restSeconds: number
  sets: ActiveSet[]
}

export interface ActiveWorkoutSession {
  id: string
  name: string
  startedAt: string // ISO timestamp
  endedAt: string | null
  notes: string
  exercises: ActiveExercise[]
  lastSyncedAt: string | null
}

// What the user did last time for a given set number of a given exercise —
// drives the "previous" column on the active workout screen.
export interface PreviousSetPerformance {
  setNumber: number
  weight: number
  reps: number
  rpe: number | null
  achievedAt: string
}
