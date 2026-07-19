import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { format } from 'date-fns'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { useAppStore } from '@/stores/useAppStore'
import { colors, spacing, fontSize, radius } from '@/constants/theme'
import LogFoodSheet from '@/components/nutrition/LogFoodSheet'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CalorieRing({ eaten, target }: { eaten: number; target: number }) {
  const progress = Math.min((eaten / target) * CIRCUMFERENCE, CIRCUMFERENCE)
  return (
    <Svg width={132} height={132} viewBox="0 0 132 132">
      <Circle cx="66" cy="66" r={RADIUS} fill="none" stroke="#27272a" strokeWidth="10" />
      <Circle
        cx="66" cy="66" r={RADIUS}
        fill="none"
        stroke={colors.primary}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${CIRCUMFERENCE}`}
        transform="rotate(-90 66 66)"
      />
      <SvgText x="66" y="60" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="800">
        {eaten.toLocaleString()}
      </SvgText>
      <SvgText x="66" y="80" textAnchor="middle" fill="#a1a1aa" fontSize="13">
        of {target.toLocaleString()}
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

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  const dateStr = format(new Date(), 'yyyy-MM-dd')

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

  const target = user?.targetCalories ?? 2200
  const eaten = 0

  const quickActions = [
    { label: 'Log Food', emoji: '🍽️', primary: true, onPress: () => setLogSheetVisible(true) },
    { label: 'Add Workout', emoji: '🏋️', primary: false, onPress: () => {} },
    { label: 'Log Weight', emoji: '⚖️', primary: false, onPress: () => {} },
    { label: 'AI Coach', emoji: '🤖', primary: false, onPress: () => {} },
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
              {greeting()},{'\n'}{user?.name?.split(' ')[0] ?? 'Athlete'} 👋
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
          <CalorieRing eaten={eaten} target={target} />
          <View style={{ flex: 1, gap: 14 }}>
            <MacroBar label="Protein" eaten={0} target={user?.targetProtein ?? 140} color={colors.protein} />
            <MacroBar label="Carbs"   eaten={0} target={user?.targetCarbs ?? 220}  color={colors.carbs} />
            <MacroBar label="Fat"     eaten={0} target={user?.targetFat ?? 70}     color={colors.fat} />
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
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
              <Text style={{ color: a.primary ? '#0a0a0a' : '#fff', fontWeight: '800', fontSize: fontSize.sm }}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Streak + Water */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md,
            borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 4,
          }}>
            <Text style={{ fontSize: 22 }}>🔥</Text>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 2 }}>
              0 <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' }}>days</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Logging streak</Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md,
            borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 4,
          }}>
            <Text style={{ fontSize: 22 }}>💧</Text>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 2 }}>
              0<Text style={{ color: colors.textSecondary, fontWeight: '500', fontSize: fontSize.lg }}>/8</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Glasses of water</Text>
          </View>
        </View>
      </ScrollView>

      <LogFoodSheet
        visible={logSheetVisible}
        date={dateStr}
        onClose={() => setLogSheetVisible(false)}
        onLogged={() => setLogSheetVisible(false)}
      />
    </View>
  )
}
