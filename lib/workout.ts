import { supabase } from './supabase'

export interface WorkoutPlan {
  id: string
  name: string
  goal: string
  workout_type: string
  split_days: number
  experience: string
  created_at: string
}

export interface WorkoutDay {
  id: string
  plan_id: string
  day_number: number
  name: string
  muscle_groups: string[]
  is_rest: boolean
  exercises?: WorkoutExercise[]
}

export interface WorkoutExercise {
  id: string
  day_id: string
  order_index: number
  name: string
  sets: number
  reps: string | null
  rest_seconds: number
  muscle_primary: string
  muscles_secondary: string[]
  why: string | null
  tips: string | null
  alternatives: { name: string; reason: string }[]
}

export interface GenerateWorkoutParams {
  goal: string
  workout_type: string
  split_days: number
  selected_days: number[]   // 1=Mon … 7=Sun
  experience: string
  equipment: string
  age?: number
  sex?: string
  weight_kg?: number
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function fetchActivePlan(): Promise<WorkoutPlan | null> {
  const { data } = await supabase
    .from('workout_plans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function fetchPlanDays(planId: string): Promise<WorkoutDay[]> {
  const { data } = await supabase
    .from('workout_days')
    .select('*, exercises:workout_exercises(*)')
    .eq('plan_id', planId)
    .order('day_number')
  return (data ?? []).map((d) => ({
    ...d,
    exercises: (d.exercises ?? []).sort(
      (a: WorkoutExercise, b: WorkoutExercise) => a.order_index - b.order_index,
    ),
  }))
}

export async function fetchLoggedDays(planId: string): Promise<Set<string>> {
  const { data: days } = await supabase
    .from('workout_days')
    .select('id')
    .eq('plan_id', planId)

  const dayIds = (days ?? []).map((d) => d.id)
  if (dayIds.length === 0) return new Set()

  // Logs from the current 7-day cycle
  const since = new Date()
  since.setDate(since.getDate() - 6)

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('day_id')
    .in('day_id', dayIds)
    .gte('completed_at', since.toISOString())

  return new Set((logs ?? []).map((l) => l.day_id))
}

export async function logWorkoutDay(dayId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('workout_logs')
    .insert({ day_id: dayId, user_id: session.user.id })
  if (error) throw error
}

// ── Generate + save ───────────────────────────────────────────────────────────

export async function generateAndSavePlan(
  params: GenerateWorkoutParams,
): Promise<WorkoutPlan> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  // Call Edge Function
  const res = await supabase.functions.invoke('generate-workout', {
    body: params,
  })
  if (res.error) throw new Error(res.error.message)

  const generated = res.data as {
    name: string
    days: Array<{
      day_number: number
      name: string
      muscle_groups: string[]
      is_rest: boolean
      exercises: Array<{
        order_index: number
        name: string
        sets: number
        reps: string
        rest_seconds: number
        muscle_primary: string
        muscles_secondary: string[]
        why: string
        tips: string
        alternatives: { name: string; reason: string }[]
      }>
    }>
  }

  // Delete any existing plan for this user
  const { data: existing } = await supabase
    .from('workout_plans')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existing) {
    await supabase.from('workout_plans').delete().eq('id', existing.id)
  }

  // Save plan
  const { data: plan, error: planErr } = await supabase
    .from('workout_plans')
    .insert({
      user_id: session.user.id,
      name: generated.name,
      goal: params.goal,
      workout_type: params.workout_type,
      split_days: params.split_days,
      experience: params.experience,
    })
    .select()
    .single()
  if (planErr) throw planErr

  // Save days + exercises
  for (const day of generated.days) {
    const { data: savedDay, error: dayErr } = await supabase
      .from('workout_days')
      .insert({
        plan_id: plan.id,
        day_number: day.day_number,
        name: day.name,
        muscle_groups: day.muscle_groups,
        is_rest: day.is_rest,
      })
      .select()
      .single()
    if (dayErr) throw dayErr

    if (day.exercises.length > 0) {
      const { error: exErr } = await supabase
        .from('workout_exercises')
        .insert(
          day.exercises.map((ex) => ({
            day_id: savedDay.id,
            order_index: ex.order_index,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            muscle_primary: ex.muscle_primary,
            muscles_secondary: ex.muscles_secondary,
            why: ex.why,
            tips: ex.tips,
            alternatives: ex.alternatives,
          })),
        )
      if (exErr) throw exErr
    }
  }

  return plan
}
