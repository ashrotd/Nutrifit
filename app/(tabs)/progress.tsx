import { View, Text } from 'react-native'
import { colors, fontSize, spacing } from '@/constants/theme'

export default function ProgressScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 48 }}>📈</Text>
      <Text style={{ fontSize: fontSize.xl, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md }}>Progress</Text>
      <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.sm }}>Coming soon...</Text>
    </View>
  )
}
