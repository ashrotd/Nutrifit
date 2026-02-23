import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { colors, fontSize, spacing, radius } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/stores/useAppStore'

export default function OnboardingScreen() {
  const { user, setOnboarded } = useAppStore()

  async function handleSkip() {
    // Mark onboarding complete
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user?.id)

    setOnboarded(true)
    router.replace('/(tabs)')
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.bg,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    }}>
      <Text style={{ fontSize: 64 }}>💪</Text>
      <Text style={{
        fontSize: fontSize.xxxl,
        fontWeight: '800',
        color: colors.textPrimary,
        marginTop: spacing.lg,
        textAlign: 'center',
      }}>
        Let's set up your profile
      </Text>
      <Text style={{
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        textAlign: 'center',
      }}>
        We'll calculate your personalized calorie and macro targets
      </Text>

      <TouchableOpacity
        onPress={handleSkip}
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          padding: spacing.md,
          paddingHorizontal: spacing.xl,
          marginTop: spacing.xxl,
        }}
      >
        <Text style={{
          color: '#fff',
          fontSize: fontSize.md,
          fontWeight: '700',
        }}>
          Get Started →
        </Text>
      </TouchableOpacity>
    </View>
  )
}