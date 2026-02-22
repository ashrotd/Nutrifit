import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

// Weight formatting
export function formatWeight(weight: number, unit: 'kg' | 'lbs'): string {
  return `${weight.toFixed(1)} ${unit}`
}

// Calorie formatting
export function formatCalories(calories: number): string {
  return `${Math.round(calories)} kcal`
}

// Macro formatting
export function formatMacro(grams: number, label: string): string {
  return `${Math.round(grams)}g ${label}`
}

// Date formatting
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export function formatShortDate(date: string | Date): string {
  return format(new Date(date), 'MMM d')
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatWorkoutDate(date: string | Date): string {
  return format(new Date(date), 'EEEE, MMM d')
}

// Duration formatting
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// Volume formatting (total kg lifted)
export function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`
  return `${Math.round(kg)}kg`
}

// Percentage formatting
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

// Height formatting
export function formatHeight(cm: number, unit: 'cm' | 'ft'): string {
  if (unit === 'cm') return `${cm} cm`
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

// Streak formatting
export function formatStreak(days: number): string {
  if (days === 0) return 'No streak yet'
  if (days === 1) return '1 day streak 🔥'
  return `${days} day streak 🔥`
}

// Trend formatting (weight change per week)
export function formatWeightTrend(kgPerWeek: number): string {
  if (Math.abs(kgPerWeek) < 0.1) return 'Stable ➡️'
  if (kgPerWeek < 0) return `${Math.abs(kgPerWeek).toFixed(1)} kg/week loss 📉`
  return `${kgPerWeek.toFixed(1)} kg/week gain 📈`
}