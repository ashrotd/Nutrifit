import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, spacing } from '@/constants/theme'

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets()
  return (
    <View style={{
      flex: 1, backgroundColor: colors.bg,
      paddingTop: insets.top + spacing.md,
      alignItems: 'center', justifyContent: 'center',
      gap: 12, paddingHorizontal: spacing.md,
    }}>
      <View style={{
        width: 64, height: 64, borderRadius: 20,
        backgroundColor: colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name="barbell" size={32} color={colors.primary} />
      </View>
      <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: '800', textAlign: 'center' }}>
        Workouts coming soon
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 22 }}>
        Workout tracking, exercise logging, and AI-generated plans are on the way in the next version.
      </Text>
    </View>
  )
}
