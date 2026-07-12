import { View, Text, TouchableOpacity } from 'react-native'
import { colors, fontSize, spacing, radius } from '@/constants/theme'
import { Goal } from '@/types'
import { goalLabels } from '@/constants/config'

interface Step3Props {
  goal: Goal | null
  setGoal: (goal: Goal) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Goal({ goal, setGoal, onNext, onBack }: Step3Props) {
  return (
    <View style={{ padding: spacing.lg, paddingTop: spacing.xxl }}>

      {/* Title */}
      <Text style={{
        fontSize: fontSize.xxl,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: spacing.xl,
        marginTop: spacing.xxl,
      }}>
        What's your goal?
      </Text>

      {/* Goal options */}
      <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
        Select your goal
      </Text>
      <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        {(Object.keys(goalLabels) as Goal[]).map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setGoal(g)}
            style={{
              padding: spacing.md,
              borderRadius: radius.md,
              borderWidth: 1,
              backgroundColor: goal === g ? colors.primary : colors.bgCard,
              borderColor: goal === g ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: goal === g ? '#fff' : colors.textPrimary, fontWeight: '600', fontSize: fontSize.md }}>
              {goalLabels[g]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
        <TouchableOpacity
          onPress={onBack}
          style={{
            flex: 1,
            padding: spacing.md,
            backgroundColor: colors.bgCard,
            borderRadius: radius.md,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={!goal}
          style={{
            flex: 1,
            padding: spacing.md,
            backgroundColor: !goal ? colors.primaryDark : colors.primary,
            borderRadius: radius.md,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Next →</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}
