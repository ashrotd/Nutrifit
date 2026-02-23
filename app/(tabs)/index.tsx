import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useAppStore } from '@/stores/useAppStore'
import { colors, spacing, fontSize, radius } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardScreen() {
  const { user } = useAppStore()
  const { signOut } = useAuth()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
      }}>
        <View>
          <Text style={{
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            fontWeight: '500',
          }}>
            {greeting()} 👋
          </Text>
          <Text style={{
            fontSize: fontSize.xxl,
            color: colors.textPrimary,
            fontWeight: '800',
            marginTop: 2,
          }}>
            {user?.name ?? 'Athlete'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={signOut}
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: radius.full,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Calories Card */}
      <View style={{
        backgroundColor: colors.bgCard,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{
          fontSize: fontSize.sm,
          color: colors.textSecondary,
          fontWeight: '600',
          marginBottom: spacing.sm,
        }}>
          TODAY'S CALORIES
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 6,
        }}>
          <Text style={{
            fontSize: 48,
            fontWeight: '800',
            color: colors.textPrimary,
          }}>
            0
          </Text>
          <Text style={{
            fontSize: fontSize.md,
            color: colors.textSecondary,
          }}>
            / {user?.targetCalories ?? 2000} kcal
          </Text>
        </View>

        {/* Progress bar */}
        <View style={{
          height: 8,
          backgroundColor: colors.bgInput,
          borderRadius: radius.full,
          marginTop: spacing.md,
        }}>
          <View style={{
            height: 8,
            width: '0%',
            backgroundColor: colors.primary,
            borderRadius: radius.full,
          }} />
        </View>

        {/* Macros row */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: spacing.md,
        }}>
          {[
            { label: 'Protein', value: '0g', target: `${user?.targetProtein ?? 150}g`, color: colors.protein },
            { label: 'Carbs', value: '0g', target: `${user?.targetCarbs ?? 200}g`, color: colors.carbs },
            { label: 'Fat', value: '0g', target: `${user?.targetFat ?? 65}g`, color: colors.fat },
          ].map((macro) => (
            <View key={macro.label} style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: fontSize.lg,
                fontWeight: '700',
                color: macro.color,
              }}>
                {macro.value}
              </Text>
              <Text style={{
                fontSize: fontSize.xs,
                color: colors.textMuted,
                marginTop: 2,
              }}>
                {macro.label}
              </Text>
              <Text style={{
                fontSize: fontSize.xs,
                color: colors.textSecondary,
              }}>
                of {macro.target}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={{
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.md,
      }}>
        Quick Actions
      </Text>
      <View style={{
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
      }}>
        {[
          { emoji: '🎙️', label: 'Log Food\nby Voice', color: '#6366f1' },
          { emoji: '🏋️', label: 'Start\nWorkout', color: '#22d3ee' },
          { emoji: '⚖️', label: 'Log\nWeight', color: '#22c55e' },
          { emoji: '🤖', label: 'AI\nCoach', color: '#f59e0b' },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={{
              flex: 1,
              backgroundColor: colors.bgCard,
              borderRadius: radius.lg,
              padding: spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              gap: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 28 }}>{action.emoji}</Text>
            <Text style={{
              fontSize: fontSize.xs,
              color: colors.textSecondary,
              textAlign: 'center',
              fontWeight: '600',
            }}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Row */}
      <View style={{
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
      }}>
        {[
          { label: 'Streak', value: '0 days', emoji: '🔥' },
          { label: 'This Week', value: '0 workouts', emoji: '💪' },
          { label: 'Water', value: '0 / 2.5L', emoji: '💧' },
        ].map((stat) => (
          <View
            key={stat.label}
            style={{
              flex: 1,
              backgroundColor: colors.bgCard,
              borderRadius: radius.lg,
              padding: spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{stat.emoji}</Text>
            <Text style={{
              fontSize: fontSize.sm,
              fontWeight: '700',
              color: colors.textPrimary,
            }}>
              {stat.value}
            </Text>
            <Text style={{
              fontSize: fontSize.xs,
              color: colors.textMuted,
              marginTop: 2,
            }}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}