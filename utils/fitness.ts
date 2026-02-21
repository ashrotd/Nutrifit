import { ActivityLevel, Goal, Sex } from "../types";

// Mifflin-St Jeor BMR formula (most accurate)
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  sex: Sex
): number {
  if (sex === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}           
 
// TDEE from BMR + activity multiplier
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  }
  return Math.round(bmr * multipliers[activityLevel])
}

// Calorie target based on goal
export function calculateTargetCalories(
  tdee: number,
  goal: Goal
): number {
  switch (goal) {
    case 'fat_loss':
      return Math.round(tdee * 0.8)      // 20% deficit
    case 'muscle_gain':
      return Math.round(tdee * 1.1)      // 10% surplus
    case 'recomposition':
      return Math.round(tdee)            // maintenance
    case 'endurance':
      return Math.round(tdee * 1.05)     // slight surplus
    case 'maintenance':
      return Math.round(tdee)
  }
}


// Macro targets in grams
export function calculateMacros(
  targetCalories: number,
  weight: number, // kg
  goal: Goal
): { protein: number; carbs: number; fat: number } {
  // Protein: 2g per kg for muscle gain, 1.8g for others
  const proteinPerKg = goal === 'muscle_gain' ? 2.2 : 1.8
  const protein = Math.round(weight * proteinPerKg)

  // Fat: 25% of calories
  const fat = Math.round((targetCalories * 0.25) / 9)

  // Carbs: remaining calories
  const proteinCalories = protein * 4
  const fatCalories = fat * 9
  const carbs = Math.round((targetCalories - proteinCalories - fatCalories) / 4)

  return { protein, carbs, fat }
}

// BMI
export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

// BMI category
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

// Epley formula for 1 Rep Max
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

// Convert lbs to kg
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10
}

// Convert kg to lbs
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10
}

// Convert cm to feet/inches string
export function cmToFeetInches(cm: number): string {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

// Ideal weight range (Devine formula)
export function getIdealWeightRange(
  height: number, // cm
  sex: Sex
): { min: number; max: number } {
  const heightInches = height / 2.54
  const baseInches = 60 // 5 feet

  let base: number
  let perInch: number

  if (sex === 'male') {
    base = 50
    perInch = 2.3
  } else {
    base = 45.5
    perInch = 2.3
  }

  const ideal = base + perInch * (heightInches - baseInches)
  return {
    min: Math.round(ideal * 0.9),
    max: Math.round(ideal * 1.1),
  }
}