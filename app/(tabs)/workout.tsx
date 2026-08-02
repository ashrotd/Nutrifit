import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Alert,
} from 'react-native'
import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, radius } from '@/constants/theme'
import {
  fetchActivePlan, fetchPlanDays, fetchLoggedDays, logWorkoutDay,
  generateAndSavePlan,
  type WorkoutPlan, type WorkoutDay, type WorkoutExercise,
} from '@/lib/workout'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/stores/useAppStore'

// ── Constants ─────────────────────────────────────────────────────────────────
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const GOALS = [
  { key: 'hypertrophy', label: 'Build Muscle',  icon: 'barbell-outline' },
  { key: 'strength',    label: 'Get Stronger',  icon: 'trending-up-outline' },
  { key: 'fat_loss',   label: 'Lose Fat',       icon: 'flame-outline' },
  { key: 'endurance',  label: 'Endurance',      icon: 'bicycle-outline' },
] as const

const TYPES = [
  { key: 'weights', label: 'Weight Training', icon: 'barbell-outline' },
  { key: 'cardio',  label: 'Cardio',          icon: 'heart-outline' },
  { key: 'mixed',   label: 'Mixed',           icon: 'shuffle-outline' },
] as const

const EXPERIENCE = [
  { key: 'beginner',     label: 'Beginner',     sub: 'Less than 1 year' },
  { key: 'intermediate', label: 'Intermediate', sub: '1–3 years' },
  { key: 'advanced',     label: 'Advanced',     sub: '3+ years' },
] as const

const EQUIPMENT = [
  { key: 'full_gym', label: 'Full Gym',  sub: 'Barbells, cables, machines' },
  { key: 'home',     label: 'Home Gym', sub: 'Dumbbells, some equipment' },
  { key: 'minimal',  label: 'Minimal',  sub: 'Bodyweight & resistance bands' },
] as const

// ── Reusable option button ────────────────────────────────────────────────────
function OptionButton({
  label, sub, icon, selected, onPress,
}: {
  label: string; sub?: string; icon?: string; selected: boolean; onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: selected ? colors.primaryLight : colors.bgCard,
        borderRadius: radius.md, borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        padding: 14, marginBottom: 10,
      }}
    >
      {icon && (
        <Ionicons
          name={icon as React.ComponentProps<typeof Ionicons>['name']}
          size={20} color={selected ? colors.primary : colors.textSecondary}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ color: selected ? colors.primary : '#fff', fontWeight: '700', fontSize: fontSize.sm }}>
          {label}
        </Text>
        {sub && (
          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>{sub}</Text>
        )}
      </View>
      {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
    </TouchableOpacity>
  )
}

// ── Exercise card with educational expand ─────────────────────────────────────
function ExerciseCard({ ex, experience }: { ex: WorkoutExercise; experience: string }) {
  const [expanded, setExpanded] = useState(false)
  const isFailure = experience !== 'beginner'

  return (
    <View style={{
      backgroundColor: colors.bg, borderRadius: radius.md,
      borderWidth: 1, borderColor: colors.border, marginBottom: 10,
    }}>
      <TouchableOpacity
        onPress={() => setExpanded(e => !e)}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.sm }}>{ex.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
            {ex.sets} sets · {isFailure ? 'push to failure' : `${ex.reps} reps`} · {ex.rest_seconds}s rest
          </Text>
        </View>
        <View style={{
          backgroundColor: colors.primaryLight, borderRadius: 99,
          paddingHorizontal: 8, paddingVertical: 3,
        }}>
          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
            {ex.muscle_primary}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16} color={colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, padding: 14, gap: 12 }}>
          {/* Secondary muscles */}
          {ex.muscles_secondary.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {ex.muscles_secondary.map(m => (
                <View key={m} style={{
                  backgroundColor: colors.bgCard, borderRadius: 99,
                  paddingHorizontal: 8, paddingVertical: 3,
                }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{m}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Why this exercise */}
          {ex.why && (
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' }}>
                WHY THIS EXERCISE
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 }}>
                {ex.why}
              </Text>
            </View>
          )}

          {/* Form tip */}
          {ex.tips && (
            <View style={{
              backgroundColor: colors.bgCard, borderRadius: radius.sm,
              padding: 10, flexDirection: 'row', gap: 8, alignItems: 'flex-start',
            }}>
              <Ionicons name="bulb-outline" size={14} color={colors.primary} style={{ marginTop: 2 }} />
              <Text style={{ color: '#fff', fontSize: fontSize.xs, flex: 1, lineHeight: 18 }}>
                {ex.tips}
              </Text>
            </View>
          )}

          {/* Alternatives */}
          {ex.alternatives?.length > 0 && (
            <View style={{ gap: 6 }}>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' }}>
                ALTERNATIVES
              </Text>
              {ex.alternatives.map((alt, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                  <Ionicons name="swap-horizontal-outline" size={13} color={colors.textMuted} style={{ marginTop: 2 }} />
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, flex: 1, lineHeight: 18 }}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>{alt.name}</Text>
                    {' — '}{alt.reason}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

// ── Day detail modal ──────────────────────────────────────────────────────────
function DayModal({
  day, experience, done, onLog, onClose,
}: {
  day: WorkoutDay; experience: string; done: boolean
  onLog: () => Promise<void>; onClose: () => void
}) {
  const [logging, setLogging] = useState(false)

  async function handleLog() {
    setLogging(true)
    try { await onLog() } finally { setLogging(false) }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          padding: spacing.md, paddingTop: spacing.xl ?? 32,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' }}>
              {day.muscle_groups.join(' · ').toUpperCase()}
            </Text>
            <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: '800' }}>{day.name}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}>
          {(day.exercises ?? []).map(ex => (
            <ExerciseCard key={ex.id} ex={ex} experience={experience} />
          ))}
        </ScrollView>

        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: spacing.md, backgroundColor: colors.bg,
          borderTopWidth: 1, borderTopColor: colors.border,
        }}>
          <TouchableOpacity
            onPress={done ? undefined : handleLog}
            style={{
              backgroundColor: done ? colors.bgCard : colors.primary,
              borderRadius: radius.md, padding: 16,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
            }}
          >
            {logging ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <>
                <Ionicons
                  name={done ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={20} color={done ? colors.primary : '#0a0a0a'}
                />
                <Text style={{ color: done ? colors.primary : '#0a0a0a', fontWeight: '800', fontSize: fontSize.md }}>
                  {done ? 'Completed this week' : 'Mark as done'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

// ── Setup wizard ──────────────────────────────────────────────────────────────
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function SetupWizard({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets()
  const { user } = useAppStore()
  const [step, setStep]               = useState(0)
  const [goal, setGoal]               = useState('')
  const [type, setType]               = useState('')
  const [days, setDays]               = useState(4)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [exp, setExp]                 = useState('')
  const [equip, setEquip]             = useState('')
  const [generating, setGenerating]   = useState(false)

  function toggleDay(dayNum: number) {
    setSelectedDays(prev =>
      prev.includes(dayNum)
        ? prev.filter(d => d !== dayNum)
        : prev.length < days ? [...prev, dayNum].sort((a, b) => a - b) : prev
    )
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      await generateAndSavePlan({
        goal,
        workout_type: type,
        split_days: days,
        selected_days: selectedDays,
        experience: exp,
        equipment: equip,
        age: user?.age ?? undefined,
        sex: user?.sex ?? undefined,
        weight_kg: user?.weight ?? undefined,
      })
      onDone()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setGenerating(false)
    }
  }

  const steps = [
    <View key="goal">
      <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 }}>
        What's your goal?
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 24 }}>
        This shapes exercise selection, rep ranges, and rest times.
      </Text>
      {GOALS.map(g => (
        <OptionButton key={g.key} label={g.label} icon={g.icon}
          selected={goal === g.key} onPress={() => setGoal(g.key)} />
      ))}
    </View>,

    <View key="type">
      <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 }}>
        Training style?
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 24 }}>
        Weights builds muscle and strength. Cardio improves stamina. Mixed does both.
      </Text>
      {TYPES.map(t => (
        <OptionButton key={t.key} label={t.label} icon={t.icon}
          selected={type === t.key} onPress={() => setType(t.key)} />
      ))}
    </View>,

    <View key="days">
      <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 }}>
        How many days per week?
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 24 }}>
        More days isn't always better — recovery is where you grow.
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {([3, 4, 5] as const).map(n => (
          <TouchableOpacity
            key={n} onPress={() => { setDays(n); setSelectedDays([]) }}
            style={{
              flex: 1, paddingVertical: 20, borderRadius: radius.md,
              backgroundColor: days === n ? colors.primaryLight : colors.bgCard,
              borderWidth: 1, borderColor: days === n ? colors.primary : colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: days === n ? colors.primary : '#fff', fontSize: 28, fontWeight: '800' }}>{n}</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>days</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    <View key="which-days">
      <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 }}>
        Which days?
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 24 }}>
        Pick exactly {days} days. The app will assign workouts to these and rest to the others.
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {WEEK_DAYS.map((label, i) => {
          const dayNum  = i + 1
          const sel     = selectedDays.includes(dayNum)
          const maxed   = !sel && selectedDays.length >= days
          return (
            <TouchableOpacity
              key={dayNum}
              onPress={() => !maxed && toggleDay(dayNum)}
              style={{
                flex: 1, paddingVertical: 14, borderRadius: radius.md,
                backgroundColor: sel ? colors.primaryLight : colors.bgCard,
                borderWidth: 1, borderColor: sel ? colors.primary : colors.border,
                alignItems: 'center', opacity: maxed ? 0.35 : 1,
              }}
            >
              <Text style={{ color: sel ? colors.primary : '#fff', fontSize: fontSize.xs, fontWeight: '800' }}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      {selectedDays.length > 0 && (
        <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 14, textAlign: 'center' }}>
          {selectedDays.length}/{days} selected
        </Text>
      )}
    </View>,

    <View key="exp">
      <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 }}>
        Your experience level?
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 24 }}>
        Beginners get rep targets. Intermediate and advanced push to failure.
      </Text>
      {EXPERIENCE.map(e => (
        <OptionButton key={e.key} label={e.label} sub={e.sub}
          selected={exp === e.key} onPress={() => setExp(e.key)} />
      ))}
    </View>,

    <View key="equip">
      <Text style={{ color: '#fff', fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 }}>
        What equipment do you have?
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 24 }}>
        The app will pick exercises that match what's available to you.
      </Text>
      {EQUIPMENT.map(e => (
        <OptionButton key={e.key} label={e.label} sub={e.sub}
          selected={equip === e.key} onPress={() => setEquip(e.key)} />
      ))}
    </View>,
  ]

  const canNext = [!!goal, !!type, true, selectedDays.length === days, !!exp, !!equip][step]
  const isLast  = step === steps.length - 1

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingTop: insets.top + spacing.md,
          paddingBottom: 120,
        }}
      >
        {/* Progress bar */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 32 }}>
          {steps.map((_, i) => (
            <View key={i} style={{
              height: 4, flex: 1, borderRadius: 99,
              backgroundColor: i <= step ? colors.primary : colors.border,
            }} />
          ))}
        </View>

        {steps[step]}
      </ScrollView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 10,
        padding: spacing.md, backgroundColor: colors.bg,
        borderTopWidth: 1, borderTopColor: colors.border,
      }}>
        {step > 0 && (
          <TouchableOpacity
            onPress={() => setStep(s => s - 1)}
            style={{
              flex: 1, padding: 14, borderRadius: radius.md,
              borderWidth: 1, borderColor: colors.border, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={isLast ? handleGenerate : () => setStep(s => s + 1)}
          disabled={!canNext || generating}
          style={{
            flex: 2, padding: 14, borderRadius: radius.md,
            backgroundColor: canNext ? colors.primary : colors.bgCard,
            alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
          }}
        >
          {generating ? (
            <>
              <ActivityIndicator color="#0a0a0a" size="small" />
              <Text style={{ color: '#0a0a0a', fontWeight: '800' }}>Generating plan…</Text>
            </>
          ) : (
            <Text style={{ color: canNext ? '#0a0a0a' : colors.textMuted, fontWeight: '800' }}>
              {isLast ? 'Generate my plan' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ── Plan view ─────────────────────────────────────────────────────────────────
function PlanView({
  plan, days, loggedDays, onLogDay, onReset,
}: {
  plan: WorkoutPlan; days: WorkoutDay[]; loggedDays: Set<string>
  onLogDay: (dayId: string) => Promise<void>; onReset: () => void
}) {
  const insets = useSafeAreaInsets()
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)

  const todayDow    = new Date().getDay()                  // 0 = Sun
  const todayDayNum = todayDow === 0 ? 7 : todayDow       // 1 = Mon … 7 = Sun

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Fixed header — safe area aware */}
      <View style={{
        paddingTop: insets.top + spacing.sm,
        paddingLeft: spacing.md,
        paddingRight: spacing.md + (insets.right ?? 0),
        paddingBottom: spacing.sm,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: colors.bg,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Your plan</Text>
          <Text style={{ color: '#fff', fontSize: fontSize.lg, fontWeight: '800' }} numberOfLines={1}>
            {plan.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('New Plan', 'This will delete your current plan.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: onReset },
            ])
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="refresh-outline" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: 32,
        }}
      >

        {/* 7-day week strip */}
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '700', marginBottom: 12 }}>
          THIS WEEK
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.lg }}>
          {days.map(day => {
            const done    = loggedDays.has(day.id)
            const isToday = day.day_number === todayDayNum
            return (
              <TouchableOpacity
                key={day.id}
                onPress={() => !day.is_rest && setSelectedDay(day)}
                activeOpacity={day.is_rest ? 1 : 0.7}
                style={{
                  flex: 1, alignItems: 'center', gap: 6, paddingVertical: 10,
                  backgroundColor: done ? colors.primaryLight : isToday ? colors.bgCard : 'transparent',
                  borderRadius: radius.sm,
                  borderWidth: isToday ? 1 : 0, borderColor: colors.border,
                  opacity: day.is_rest ? 0.4 : 1,
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600' }}>
                  {DOW[day.day_number - 1]}
                </Text>
                {day.is_rest
                  ? <Ionicons name="moon-outline" size={18} color={colors.textMuted} />
                  : done
                    ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    : <Ionicons name="barbell-outline" size={18} color={isToday ? '#fff' : colors.textMuted} />
                }
                <Text style={{
                  fontSize: 9, fontWeight: '700', textAlign: 'center',
                  color: done ? colors.primary : isToday ? '#fff' : colors.textMuted,
                }}>
                  {day.is_rest ? 'Rest' : day.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Today's card */}
        {(() => {
          const todayDay = days.find(d => d.day_number === todayDayNum)
          if (!todayDay || todayDay.is_rest) return (
            <View style={{
              backgroundColor: colors.bgCard, borderRadius: radius.md,
              borderWidth: 1, borderColor: colors.border,
              padding: spacing.md, alignItems: 'center', gap: 8, marginBottom: spacing.lg,
            }}>
              <Ionicons name="moon-outline" size={28} color={colors.textMuted} />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.md }}>Rest day today</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center' }}>
                Recovery is part of the programme. Eat well and sleep.
              </Text>
            </View>
          )
          const done = loggedDays.has(todayDay.id)
          return (
            <TouchableOpacity
              onPress={() => setSelectedDay(todayDay)}
              style={{
                backgroundColor: done ? colors.bgCard : colors.primary,
                borderRadius: radius.md, padding: spacing.md,
                flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg,
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: done ? colors.primaryLight : 'rgba(0,0,0,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons
                  name={done ? 'checkmark-circle' : 'barbell-outline'}
                  size={22} color={done ? colors.primary : '#0a0a0a'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: done ? colors.textSecondary : '#0a0a0a', fontSize: fontSize.xs, fontWeight: '600' }}>
                  {done ? 'DONE TODAY' : "TODAY'S WORKOUT"}
                </Text>
                <Text style={{ color: done ? '#fff' : '#0a0a0a', fontSize: fontSize.md, fontWeight: '800' }}>
                  {todayDay.name}
                </Text>
                <Text style={{ color: done ? colors.textMuted : 'rgba(0,0,0,0.6)', fontSize: fontSize.xs, marginTop: 2 }}>
                  {todayDay.muscle_groups.join(' · ')} · {todayDay.exercises?.length ?? 0} exercises
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={done ? colors.textMuted : '#0a0a0a'} />
            </TouchableOpacity>
          )
        })()}

        {/* Full programme list */}
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '700', marginBottom: 12 }}>
          FULL PROGRAMME
        </Text>
        {days.filter(d => !d.is_rest).map(day => {
          const done = loggedDays.has(day.id)
          return (
            <TouchableOpacity
              key={day.id}
              onPress={() => setSelectedDay(day)}
              style={{
                backgroundColor: colors.bgCard, borderRadius: radius.md,
                borderWidth: 1, borderColor: done ? colors.primary + '40' : colors.border,
                padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
              }}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: done ? colors.primaryLight : colors.bg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {done
                  ? <Ionicons name="checkmark" size={20} color={colors.primary} />
                  : <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '800' }}>
                      {DOW[day.day_number - 1]}
                    </Text>
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.sm }}>{day.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
                  {day.muscle_groups.join(' · ')} · {day.exercises?.length ?? 0} exercises
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {selectedDay && (
        <DayModal
          day={selectedDay}
          experience={plan.experience}
          done={loggedDays.has(selectedDay.id)}
          onLog={async () => {
            await onLogDay(selectedDay.id)
            setSelectedDay(null)
          }}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </View>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function WorkoutScreen() {
  const [loading, setLoading]       = useState(true)
  const [plan, setPlan]             = useState<WorkoutPlan | null>(null)
  const [days, setDays]             = useState<WorkoutDay[]>([])
  const [loggedDays, setLoggedDays] = useState<Set<string>>(new Set())
  const [showSetup, setShowSetup]   = useState(false)

  const loadPlan = useCallback(async () => {
    setLoading(true)
    const p = await fetchActivePlan()
    if (p) {
      const [d, logged] = await Promise.all([fetchPlanDays(p.id), fetchLoggedDays(p.id)])
      setPlan(p); setDays(d); setLoggedDays(logged)
    } else {
      setPlan(null); setDays([])
    }
    setLoading(false)
  }, [])

  useFocusEffect(useCallback(() => { loadPlan() }, [loadPlan]))

  async function handleLogDay(dayId: string) {
    await logWorkoutDay(dayId)
    setLoggedDays(prev => new Set([...prev, dayId]))
  }

  async function handleReset() {
    await supabase.from('workout_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setPlan(null); setDays([]); setShowSetup(true)
  }

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  )

  if (showSetup || !plan) {
    return <SetupWizard onDone={() => { setShowSetup(false); loadPlan() }} />
  }

  return (
    <PlanView
      plan={plan} days={days} loggedDays={loggedDays}
      onLogDay={handleLogDay} onReset={handleReset}
    />
  )
}
