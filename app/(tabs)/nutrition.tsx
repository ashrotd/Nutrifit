import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState, useCallback } from 'react'
import { format, addDays, isToday, isYesterday } from 'date-fns'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useAppStore } from '@/stores/useAppStore'
import { colors, spacing, fontSize, radius } from '@/constants/theme'
import { fetchDayLogs, sumNutrition, MealLog, MealType } from '@/lib/foodAgent'
import LogFoodSheet from '@/components/nutrition/LogFoodSheet'

const MEALS: { label: string; key: MealType }[] = [
  { label: 'Breakfast', key: 'breakfast' },
  { label: 'Lunch', key: 'lunch' },
  { label: 'Dinner', key: 'dinner' },
  { label: 'Snacks', key: 'snack' },
]

function formatDateLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEE, MMM d')
}

export default function NutritionScreen() {
  const { user } = useAppStore()
  const insets = useSafeAreaInsets()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null)

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const dateLabel = formatDateLabel(currentDate)
  const dateSubLabel = format(currentDate, 'EEEE, MMM d')

  const target = user?.targetCalories ?? 2200
  const targetProtein = user?.targetProtein ?? 140
  const targetCarbs = user?.targetCarbs ?? 220
  const targetFat = user?.targetFat ?? 70

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true)
    try {
      const logs = await fetchDayLogs(dateStr)
      setMealLogs(logs)
    } finally {
      setLoadingLogs(false)
    }
  }, [dateStr])

  useFocusEffect(useCallback(() => { loadLogs() }, [loadLogs]))

  const nutrition = sumNutrition(mealLogs)
  const eaten = nutrition.calories
  const remaining = target - eaten
  const caloriePercent = Math.min(eaten / target, 1)

  function getMealItems(mealKey: MealType) {
    return mealLogs.filter(l => l.mealType === mealKey).flatMap(l => l.items)
  }

  function getMealCalories(mealKey: MealType) {
    return Math.round(getMealItems(mealKey).reduce((s, i) => s + i.calories, 0))
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{
        padding: spacing.md,
        paddingTop: insets.top + spacing.md,
        paddingBottom: 32,
      }}>
        {/* Date nav */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <TouchableOpacity
            onPress={() => setCurrentDate(d => addDays(d, -1))}
            style={{
              width: 38, height: 38, borderRadius: 999,
              backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 20 }}>‹</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.lg }}>{dateLabel}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{dateSubLabel}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setCurrentDate(d => addDays(d, 1))}
            style={{
              width: 38, height: 38, borderRadius: 999,
              backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calorie summary card */}
        <View style={{
          backgroundColor: colors.bgCard, borderRadius: radius.lg,
          borderWidth: 1, borderColor: colors.border,
          padding: spacing.md, gap: 14, marginBottom: spacing.sm,
        }}>
          {loadingLogs ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>
                  {eaten.toLocaleString()}{' '}
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' }}>
                    / {target.toLocaleString()} kcal
                  </Text>
                </Text>
                <Text style={{
                  color: remaining >= 0 ? colors.primary : colors.danger,
                  fontSize: fontSize.sm, fontWeight: '700',
                }}>
                  {remaining >= 0 ? `${remaining.toLocaleString()} left` : `${Math.abs(remaining)} over`}
                </Text>
              </View>

              <View style={{ height: 7, backgroundColor: '#27272a', borderRadius: 99, overflow: 'hidden' }}>
                <View style={{
                  width: `${Math.round(caloriePercent * 100)}%`,
                  height: '100%',
                  backgroundColor: caloriePercent >= 1 ? colors.danger : colors.primary,
                  borderRadius: 99,
                }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                {[
                  { key: 'P', value: nutrition.protein, target: targetProtein, color: colors.protein },
                  { key: 'C', value: nutrition.carbs, target: targetCarbs, color: colors.carbs },
                  { key: 'F', value: nutrition.fat, target: targetFat, color: colors.fat },
                ].map((m) => (
                  <View key={m.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <View style={{ width: 9, height: 9, borderRadius: 99, backgroundColor: m.color }} />
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                      {m.key}{' '}
                      <Text style={{ color: '#fff', fontWeight: '700' }}>{m.value}g</Text>
                      <Text style={{ color: colors.textMuted }}> / {m.target}g</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Meal sections */}
        {MEALS.map((meal) => {
          const items = getMealItems(meal.key)
          const mealCals = getMealCalories(meal.key)
          return (
            <View key={meal.key} style={{
              backgroundColor: colors.bgCard, borderRadius: radius.lg,
              borderWidth: 1, borderColor: colors.border,
              marginBottom: spacing.sm, overflow: 'hidden',
            }}>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                padding: 16,
                borderBottomWidth: items.length > 0 ? 1 : 0,
                borderBottomColor: colors.border,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.md }}>
                    {meal.label}
                  </Text>
                  {mealCals > 0 && (
                    <View style={{
                      backgroundColor: colors.bgInput,
                      borderRadius: 999,
                      paddingHorizontal: 10, paddingVertical: 3,
                    }}>
                      <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' }}>
                        {mealCals} kcal
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setActiveMeal(meal.key)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '800', fontSize: fontSize.md }}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {items.length === 0 ? (
                <View style={{ padding: 16 }}>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Nothing logged yet</Text>
                </View>
              ) : (
                items.map((item, i) => (
                  <View key={item.id} style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: 12, paddingHorizontal: 16,
                    borderBottomWidth: i < items.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                    gap: 12,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '600' }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' }}>
                      {Math.round(item.calories)} kcal
                    </Text>
                  </View>
                ))
              )}
            </View>
          )
        })}
      </ScrollView>

      {activeMeal && (
        <LogFoodSheet
          visible
          initialMealType={activeMeal}
          date={dateStr}
          onClose={() => setActiveMeal(null)}
          onLogged={() => {
            setActiveMeal(null)
            loadLogs()
          }}
        />
      )}
    </View>
  )
}
