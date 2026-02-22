import { NutritionSummary, FoodItem } from '../types'

// Aggregate nutrition from food items
export function aggregateNutrition(items: FoodItem[]): NutritionSummary {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      fiber: acc.fiber + (item.fiber ?? 0),
      sugar: acc.sugar + (item.sugar ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  )
}

// Macro percentage breakdown
export function getMacroPercentages(nutrition: NutritionSummary): {
  proteinPct: number
  carbsPct: number
  fatPct: number
} {
  const totalCalories =
    nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9

  if (totalCalories === 0) {
    return { proteinPct: 0, carbsPct: 0, fatPct: 0 }
  }

  return {
    proteinPct: Math.round(((nutrition.protein * 4) / totalCalories) * 100),
    carbsPct: Math.round(((nutrition.carbs * 4) / totalCalories) * 100),
    fatPct: Math.round(((nutrition.fat * 9) / totalCalories) * 100),
  }
}

// Remaining macros for the day
export function getRemainingMacros(
  consumed: NutritionSummary,
  targets: { calories: number; protein: number; carbs: number; fat: number }
): { calories: number; protein: number; carbs: number; fat: number } {
  return {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein: Math.max(0, targets.protein - consumed.protein),
    carbs: Math.max(0, targets.carbs - consumed.carbs),
    fat: Math.max(0, targets.fat - consumed.fat),
  }
}

// Progress percentage (capped at 100)
export function getMacroProgress(consumed: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, Math.round((consumed / target) * 100))
}

// Calorie breakdown by meal
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export function getCaloriesByMeal(
  items: (FoodItem & { meal: MealType })[]
): Record<MealType, number> {
  return items.reduce(
    (acc, item) => ({
      ...acc,
      [item.meal]: (acc[item.meal] ?? 0) + item.calories,
    }),
    { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
  )
}

// Estimate water intake based on weight and activity
export function getWaterTarget(
  weight: number, // kg
  activityLevel: string
): number {
  // Base: 35ml per kg
  const base = weight * 35
  const activityBonus =
    activityLevel === 'very_active' || activityLevel === 'extremely_active'
      ? 500
      : activityLevel === 'moderately_active'
      ? 300
      : 0
  return Math.round((base + activityBonus) / 100) * 100 // round to nearest 100ml
}