import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, radius } from '@/constants/theme'

const RECENT = [
  { name: 'Lower Body', meta: 'Yesterday · 52 min', volume: '7,840 kg' },
  { name: 'HIIT Intervals', meta: 'Tue · 28 min', volume: '312 kcal' },
  { name: 'Push Day', meta: 'Mon · 47 min', volume: '6,910 kg' },
]

const CHIPS = ['Bench press', 'Incline DB press', 'Rows', 'Pull-ups', '+2 more']

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets()
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: 32 }}
    >
      <Text style={{ color: '#fff', fontSize: fontSize.xxl, fontWeight: '800', letterSpacing: -0.3, marginBottom: spacing.md }}>
        Workout
      </Text>

      {/* Today's plan */}
      <View style={{
        backgroundColor: colors.bgCard, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border,
        padding: spacing.md, gap: 12, marginBottom: spacing.sm,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', letterSpacing: 1.2 }}>
              TODAY'S PLAN
            </Text>
            <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 4 }}>
              Upper Body Strength
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
              6 exercises · 45 min · Day 3 of 5
            </Text>
          </View>
          <Text style={{ fontSize: 22 }}>🏋️</Text>
        </View>

        {/* Exercise chips */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CHIPS.map((chip) => (
            <View key={chip} style={{
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10,
            }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11.5 }}>{chip}</Text>
            </View>
          ))}
        </View>

        {/* Start button */}
        <TouchableOpacity style={{
          backgroundColor: colors.primary, borderRadius: radius.md,
          padding: 14, alignItems: 'center', justifyContent: 'center',
          flexDirection: 'row', gap: 8,
        }}>
          <Text style={{ color: '#0a0a0a', fontWeight: '900', fontSize: fontSize.md }}>▶  Start Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.md }}>
        {[
          { value: '0', label: 'This week' },
          { value: '0h 0m', label: 'Total time' },
          { value: '0', label: 'Volume (kg)' },
        ].map((s) => (
          <View key={s.label} style={{
            flex: 1, backgroundColor: colors.bgCard,
            borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
            padding: 12, gap: 2,
          }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{s.value}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent sessions */}
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.md, marginBottom: spacing.sm }}>
        Recent sessions
      </Text>
      <View style={{ gap: 10 }}>
        {RECENT.map((session) => (
          <View key={session.name} style={{
            backgroundColor: colors.bgCard, borderRadius: radius.md,
            borderWidth: 1, borderColor: colors.border,
            padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: colors.primaryLight,
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ fontSize: 18 }}>🏋️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.sm }}>{session.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{session.meta}</Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.sm }}>{session.volume}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
