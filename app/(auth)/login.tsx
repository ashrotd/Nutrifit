import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/hooks/useAuth'
import { colors, spacing, fontSize, radius } from '@/constants/theme'
import NutriArcLogo from '@/components/NutriArcLogo'

export default function LoginScreen() {
  const { signIn, resendConfirmation } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()

    try {
      setLoading(true)
      await signIn(normalizedEmail, password)
      // Navigation handled by _layout.tsx auth state listener
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        `${error.message}\n\nIf you just registered, make sure you've confirmed your email first.`,
        [
          { text: 'OK', style: 'cancel' },
          {
            text: 'Resend confirmation email',
            onPress: async () => {
              try {
                await resendConfirmation(normalizedEmail)
                Alert.alert('Sent', 'Confirmation email resent. Please check your inbox.')
              } catch (resendError: any) {
                Alert.alert('Error', resendError.message)
              }
            },
          },
        ]
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
          <NutriArcLogo size={88} />
          <Text style={{
            fontSize: fontSize.xxxl,
            fontWeight: '800',
            color: colors.textPrimary,
            letterSpacing: -1,
            marginTop: spacing.sm,
          }}>
            NutriArc
          </Text>
          <Text style={{
            fontSize: fontSize.md,
            color: colors.textSecondary,
            marginTop: spacing.xs,
          }}>
            Your AI-powered fitness companion
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: spacing.md }}>
          <View>
            <Text style={{
              fontSize: fontSize.sm,
              color: colors.textSecondary,
              marginBottom: spacing.xs,
              fontWeight: '600',
            }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: colors.bgCard,
                borderRadius: radius.md,
                padding: spacing.md,
                color: colors.textPrimary,
                fontSize: fontSize.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          </View>

          <View>
            <Text style={{
              fontSize: fontSize.sm,
              color: colors.textSecondary,
              marginBottom: spacing.xs,
              fontWeight: '600',
            }}>
              Password
            </Text>
            <View style={{ justifyContent: 'center' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                style={{
                  backgroundColor: colors.bgCard,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  paddingRight: spacing.xxl,
                  color: colors.textPrimary,
                  fontSize: fontSize.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: spacing.md,
                  padding: spacing.xs,
                }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={{ alignSelf: 'flex-end' }}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={{
              color: colors.primary,
              fontSize: fontSize.sm,
              fontWeight: '600',
            }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: loading ? colors.primaryDark : colors.primary,
              borderRadius: radius.md,
              padding: spacing.md,
              alignItems: 'center',
              marginTop: spacing.sm,
            }}
          >
            <Text style={{
              color: '#fff',
              fontSize: fontSize.md,
              fontWeight: '700',
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            marginVertical: spacing.sm,
          }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={{
              borderRadius: radius.md,
              padding: spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{
              color: colors.textPrimary,
              fontSize: fontSize.md,
              fontWeight: '600',
            }}>
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}