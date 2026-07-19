import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import Svg, { Path, Circle, Line } from 'react-native-svg'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppStore } from '@/stores/useAppStore'
import { colors, spacing, fontSize, radius } from '@/constants/theme'

const PERIODS = ['30D', '90D', '1Y'] as const
type Period = typeof PERIODS[number]

const DAYS = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']
const BAR_HEIGHTS = [78, 90, 70, 96, 84, 74, 58]

const RECORDS = [
  { label: 'Bench press', value: '--', unit: 'kg' },
  { label: 'Back squat', value: '--', unit: 'kg' },
  { label: 'Deadlift', value: '--', unit: 'kg' },
]

export default function ProgressScreen() {
  const { user } = useAppStore()
  const insets = useSafeAreaInsets()
  const [period, setPeriod] = useState<Period>('30D')

  const weight = user?.weight ?? '--'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: 32 }}
    >
      {/* Header + period toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={{ color: '#fff', fontSize: fontSize.xxl, fontWeight: '800', letterSpacing: -0.3 }}>Progress</Text>
        <View style={{
          flexDirection: 'row', gap: 2,
          backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
          borderRadius: 999, padding: 3,
        }}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={{
                paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999,
                backgroundColor: period === p ? colors.primary : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 11.5, fontWeight: '800',
                color: period === p ? '#0a0a0a' : colors.textSecondary,
              }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weight chart */}
      <View style={{
        backgroundColor: colors.bgCard, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border,
        padding: spacing.md, gap: 8, marginBottom: spacing.sm,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600', letterSpacing: 0.5 }}>
              WEIGHT
            </Text>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
              {weight}{' '}
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' }}>kg</Text>
            </Text>
          </View>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: fontSize.sm }}>No data yet</Text>
        </View>

        {/* Placeholder line chart */}
        <Svg width="100%" height={110} viewBox="0 0 311 110" preserveAspectRatio="none">
          <Line x1="0" y1="30" x2="311" y2="30" stroke="#27272a" strokeWidth="1" />
          <Line x1="0" y1="60" x2="311" y2="60" stroke="#27272a" strokeWidth="1" />
          <Line x1="0" y1="90" x2="311" y2="90" stroke="#27272a" strokeWidth="1" />
          <Path
            d="M0 80 L78 75 L155 70 L233 68 L311 65 L311 110 L0 110 Z"
            fill={`${colors.primary}14`}
          />
          <Path
            d="M0 80 L78 75 L155 70 L233 68 L311 65"
            fill="none" stroke={colors.primary} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <Circle cx="311" cy="65" r="4" fill={colors.primary} />
        </Svg>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 10.5 }}>30 days ago</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 10.5 }}>15 days ago</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 10.5 }}>Today</Text>
        </View>
      </View>

      {/* Calorie bar chart */}
      <View style={{
        backgroundColor: colors.bgCard, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border,
        padding: spacing.md, gap: 10, marginBottom: spacing.md,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600', letterSpacing: 0.5 }}>
            CALORIES · LAST 7 DAYS
          </Text>
          <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '800' }}>avg --</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 74 }}>
          {BAR_HEIGHTS.map((h, i) => (
            <View key={i} style={{
              flex: 1,
              height: `${h}%`,
              backgroundColor: colors.primary,
              borderRadius: 5,
              opacity: i < BAR_HEIGHTS.length - 1 ? 0.45 : 1,
            }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {DAYS.map((d) => (
            <Text key={d} style={{ flex: 1, textAlign: 'center', color: colors.textSecondary, fontSize: 10.5 }}>{d}</Text>
          ))}
        </View>
      </View>

      {/* Personal records */}
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.md, marginBottom: spacing.sm }}>
        Personal records
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {RECORDS.map((r) => (
          <View key={r.label} style={{
            flex: 1, backgroundColor: colors.bgCard,
            borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
            padding: 14, gap: 3,
          }}>
            <Text style={{ fontSize: 16 }}>🏆</Text>
            <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800' }}>
              {r.value}
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '500' }}> {r.unit}</Text>
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{r.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
