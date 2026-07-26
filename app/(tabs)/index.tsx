import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { format } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { useAppStore } from '@/stores/useAppStore'
import { colors, spacing, fontSize, radius } from '@/constants/theme'
import { fetchDayLogs, sumNutrition, fetchStreak, type MealLog } from '@/lib/foodAgent'
import { fetchWaterGlasses, addWaterGlass, removeLastWaterGlass, fetchLatestWeight } from '@/lib/health'
import LogFoodSheet from '@/components/nutrition/LogFoodSheet'
import LogWeightSheet from '@/components/LogWeightSheet'


const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CalorieRing({ eaten, target }: { eaten: number; target: number }) {
  const progress = Math.min((eaten / target) * CIRCUMFERENCE, CIRCUMFERENCE)
  const remaining = target - eaten
  const isOver = eaten > target
  return (
    <Svg width={140} height={140} viewBox="0 0 140 140">
      <Circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#27272a" strokeWidth="11" />
      <Circle
        cx="70" cy="70" r={RADIUS}
        fill="none"
        stroke={isOver ? '#f87171' : colors.primary}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${CIRCUMFERENCE}`}
        transform="rotate(-90 70 70)"
      />
      {/* Calories eaten */}
      <SvgText x="70" y="58" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800">
        {eaten.toLocaleString()}
      </SvgText>
      {/* kcal label */}
      <SvgText x="70" y="74" textAnchor="middle" fill="#a1a1aa" fontSize="11" fontWeight="500">
        kcal
      </SvgText>
      {/* remaining / over */}
      <SvgText x="70" y="90" textAnchor="middle" fill={isOver ? '#f87171' : '#BFD32B'} fontSize="10" fontWeight="700">
        {isOver ? `${(eaten - target).toLocaleString()} over` : `${remaining.toLocaleString()} left`}
      </SvgText>
    </Svg>
  )
}

function MacroBar({ label, eaten, target, color }: { label: string; eaten: number; target: number; color: string }) {
  const pct = Math.min((eaten / target) * 100, 100)
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{label}</Text>
        <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '700' }}>
          {eaten}<Text style={{ color: colors.textSecondary, fontWeight: '400' }}>/{target}g</Text>
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: '#27272a', borderRadius: 99 }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 99 }} />
      </View>
    </View>
  )
}

export default function DashboardScreen() {
  const { user } = useAppStore()
  const insets = useSafeAreaInsets()
  const [logSheetVisible, setLogSheetVisible] = useState(false)
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [latestWeight, setLatestWeight] = useState<number | null>(null)
  const [weightSheetVisible, setWeightSheetVisible] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const dateStr = format(new Date(), 'yyyy-MM-dd')

  const loadData = useCallback(async () => {
    setLoading(true)
    const [logs, glasses, weight, s] = await Promise.all([
      fetchDayLogs(dateStr),
      fetchWaterGlasses(dateStr),
      fetchLatestWeight(),
      fetchStreak(),
    ])
    setMealLogs(logs)
    setWaterGlasses(glasses)
    setLatestWeight(weight)
    setStreak(s)
    setLoading(false)
  }, [dateStr])

  useFocusEffect(useCallback(() => { loadData() }, [loadData]))

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

  const target = user?.targetCalories ?? 2200
  const nutrition = sumNutrition(mealLogs)
  const eaten = nutrition.calories

  const quickActions: {
    label: string
    subtitle?: string
    icon: React.ComponentProps<typeof Ionicons>['name']
    primary: boolean
    onPress: () => void
  }[] = [
    { label: 'Log Food',     icon: 'nutrition-outline', primary: true,  onPress: () => setLogSheetVisible(true) },
    { label: 'Add Workout',  icon: 'barbell-outline',   primary: false, onPress: () => {} },
    { label: 'Log Weight',   icon: 'scale-outline',     primary: false, subtitle: latestWeight != null ? `${latestWeight} kg` : undefined, onPress: () => setWeightSheetVisible(true) },
    { label: 'AI Coach',     icon: 'sparkles-outline',  primary: false, onPress: () => {} },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingTop: insets.top + spacing.md,
          paddingBottom: 32,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{today}</Text>
            <Text style={{ color: '#fff', fontSize: fontSize.xxl, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 }}>
              {greeting()},{'\n'}{user?.name?.split(' ')[0] ?? 'Athlete'}
            </Text>
          </View>
          <View style={{
            width: 48, height: 48, borderRadius: 999,
            backgroundColor: colors.primary,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#0a0a0a', fontWeight: '900', fontSize: fontSize.md }}>{initials}</Text>
          </View>
        </View>

        {/* Calorie ring + macro bars */}
        <View style={{
          backgroundColor: colors.bgCard, borderRadius: radius.lg,
          borderWidth: 1, borderColor: colors.border,
          padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 20,
          marginBottom: spacing.sm,
        }}>
          {loading ? (
            <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <CalorieRing eaten={eaten} target={target} />
          )}
          <View style={{ flex: 1, gap: 14, opacity: loading ? 0.4 : 1 }}>
            <MacroBar label="Protein" eaten={nutrition.protein} target={user?.targetProtein ?? 140} color={colors.protein} />
            <MacroBar label="Carbs"   eaten={nutrition.carbs}   target={user?.targetCarbs ?? 220}  color={colors.carbs} />
            <MacroBar label="Fat"     eaten={nutrition.fat}     target={user?.targetFat ?? 70}     color={colors.fat} />
          </View>
        </View>

        {/* Quick actions 2×2 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.sm }}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={a.onPress}
              style={{
                width: '47.5%',
                backgroundColor: a.primary ? colors.primary : colors.bgCard,
                borderRadius: radius.md,
                borderWidth: a.primary ? 0 : 1,
                borderColor: colors.border,
                padding: 16,
                gap: 8,
              }}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: a.primary ? 'rgba(0,0,0,0.15)' : colors.primaryLight,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons
                  name={a.icon}
                  size={22}
                  color={a.primary ? '#0a0a0a' : colors.primary}
                />
              </View>
              <Text style={{ color: a.primary ? '#0a0a0a' : '#fff', fontWeight: '800', fontSize: fontSize.sm }}>
                {a.label}
              </Text>
              {a.subtitle && (
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: -4 }}>
                  {a.subtitle}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Streak + Water */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md,
            borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6,
          }}>
            <View style={{
              width: 38, height: 38, borderRadius: 11,
              backgroundColor: 'rgba(249,115,22,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="flame" size={20} color="#f97316" />
            </View>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 2 }}>
              {streak} <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' }}>days</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Logging streak</Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md,
            borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6,
          }}>
            <View style={{
              width: 38, height: 38, borderRadius: 11,
              backgroundColor: 'rgba(56,189,248,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="water" size={20} color="#38bdf8" />
            </View>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 2 }}>
              {waterGlasses}<Text style={{ color: colors.textSecondary, fontWeight: '500', fontSize: fontSize.lg }}>/8</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
              Glasses · <Text style={{ color: '#fff', fontWeight: '600' }}>{(waterGlasses * 0.25).toFixed(2)}</Text>
              <Text> / 2.0 L</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                onPress={async () => {
                  if (waterGlasses > 0) {
                    await removeLastWaterGlass(dateStr)
                    setWaterGlasses(w => w - 1)
                  }
                }}
                style={{
                  flex: 1, height: 32, borderRadius: 8,
                  backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="remove" size={18} color={waterGlasses > 0 ? '#fff' : colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await addWaterGlass(dateStr)
                  setWaterGlasses(w => w + 1)
                }}
                style={{
                  flex: 1, height: 32, borderRadius: 8,
                  backgroundColor: '#38bdf820', borderWidth: 1, borderColor: '#38bdf840',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="add" size={18} color="#38bdf8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <LogFoodSheet
        visible={logSheetVisible}
        date={dateStr}
        onClose={() => setLogSheetVisible(false)}
        onLogged={() => { setLogSheetVisible(false); loadData() }}
      />

      <LogWeightSheet
        visible={weightSheetVisible}
        currentWeight={latestWeight}
        onClose={() => setWeightSheetVisible(false)}
        onLogged={(kg) => { setWeightSheetVisible(false); setLatestWeight(kg) }}
      />
    </View>
  )
}
