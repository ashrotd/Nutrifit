import { supabase } from './supabase'
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from '@/utils/fitness'
import type { UserProfile } from '@/types'

export interface RecalculatedTargets {
  weight: number
  bmr: number
  tdee: number
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
}

const ML_PER_GLASS = 250

export async function fetchWaterGlasses(date: string): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('water_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('date', date)

  return count ?? 0
}

export async function addWaterGlass(date: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('water_logs').insert({
    user_id: user.id,
    amount_ml: ML_PER_GLASS,
    date,
  })
}

export async function removeLastWaterGlass(date: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('water_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single()

  if (data?.id) {
    await supabase.from('water_logs').delete().eq('id', data.id)
  }
}

export async function logWeight(weightKg: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error: insertError } = await supabase.from('metrics').insert({
    user_id: user.id,
    weight: weightKg,
  })
  if (insertError) throw insertError

  // Keep profiles.weight in sync with latest logged weight
  await supabase.from('profiles').update({ weight: weightKg }).eq('id', user.id)
}

export async function recalculateAndSaveTargets(
  weightKg: number,
  user: UserProfile,
): Promise<RecalculatedTargets> {
  const heightCm = user.heightUnit === 'ft' ? user.height * 30.48 : user.height
  const bmr = calculateBMR(weightKg, heightCm, user.age, user.sex)
  const tdee = calculateTDEE(bmr, user.activityLevel)
  const targetCalories = calculateTargetCalories(tdee, user.goal)
  const { protein, carbs, fat } = calculateMacros(targetCalories, weightKg, user.goal)

  const updates: RecalculatedTargets = {
    weight: weightKg,
    bmr: Math.round(bmr * 10) / 10,
    tdee,
    targetCalories,
    targetProtein: protein,
    targetCarbs: carbs,
    targetFat: fat,
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      weight: weightKg,
      bmr: updates.bmr,
      tdee: updates.tdee,
      target_calories: updates.targetCalories,
      target_protein: updates.targetProtein,
      target_carbs: updates.targetCarbs,
      target_fat: updates.targetFat,
    })
    .eq('id', user.id)

  if (error) throw error
  return updates
}

export async function fetchWeightHistory(
  days: number = 30,
): Promise<Array<{ date: string; weight: number }>> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data } = await supabase
    .from('metrics')
    .select('weight, recorded_at')
    .eq('user_id', user.id)
    .not('weight', 'is', null)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true })

  if (!data) return []

  // One point per day — keep the last entry for each day
  const byDate: Record<string, number> = {}
  for (const row of data) {
    const d = (row.recorded_at as string).substring(0, 10)
    byDate[d] = row.weight as number
  }

  return Object.entries(byDate).map(([date, weight]) => ({ date, weight }))
}

export async function fetchLatestWeight(): Promise<number | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('metrics')
    .select('weight')
    .eq('user_id', user.id)
    .not('weight', 'is', null)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  return data?.weight ?? null
}
