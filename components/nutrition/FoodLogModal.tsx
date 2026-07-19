import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { useState, useRef } from 'react'
import { colors, spacing, fontSize, radius } from '@/constants/theme'
import { parseFoodInput, logFoodItems, ParsedFoodItem, MealType } from '@/lib/foodAgent'

interface Props {
  visible: boolean
  mealType: MealType
  date: string
  onClose: () => void
  onLogged: () => void
}

type Stage = 'input' | 'parsing' | 'preview' | 'saving'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
}

const SCREEN_HEIGHT = Dimensions.get('window').height

export default function FoodLogModal({ visible, mealType, date, onClose, onLogged }: Props) {
  const [stage, setStage] = useState<Stage>('input')
  const [text, setText] = useState('')
  const [items, setItems] = useState<ParsedFoodItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<TextInput>(null)

  function reset() {
    setStage('input')
    setText('')
    setItems([])
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleParse() {
    if (!text.trim()) return
    setError(null)
    setStage('parsing')
    try {
      const parsed = await parseFoodInput(text.trim())
      setItems(parsed)
      setStage('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStage('input')
    }
  }

  async function handleLog() {
    setStage('saving')
    try {
      await logFoodItems(text.trim(), mealType, items, date)
      reset()
      onLogged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
      setStage('preview')
    }
  }

  const totalCalories = Math.round(items.reduce((s, i) => s + i.calories, 0))
  const totalProtein = items.reduce((s, i) => s + i.protein, 0).toFixed(1)
  const totalCarbs = items.reduce((s, i) => s + i.carbs, 0).toFixed(1)
  const totalFat = items.reduce((s, i) => s + i.fat, 0).toFixed(1)
  const isBusy = stage === 'parsing' || stage === 'saving'

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Outer container fills screen with dim overlay */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' }}>

        {/* Backdrop — flex: 1 fills all space above the sheet */}
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={handleClose}
          activeOpacity={1}
        />

        {/* Sheet slides in from bottom */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            borderTopWidth: 1,
            borderColor: colors.border,
            maxHeight: SCREEN_HEIGHT * 0.85,
          }}>

            {/* Handle bar */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: colors.border }} />
            </View>

            {/* Header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: spacing.md, paddingVertical: 10,
            }}>
              <Text style={{ color: '#fff', fontSize: fontSize.lg, fontWeight: '800' }}>
                Add to {MEAL_LABELS[mealType]}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 24, lineHeight: 26 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >

              {/* INPUT / PARSING STAGE */}
              {(stage === 'input' || stage === 'parsing') && (
                <View style={{ gap: 12 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                    Describe what you ate in plain English
                  </Text>

                  <TextInput
                    ref={inputRef}
                    value={text}
                    onChangeText={setText}
                    placeholder="e.g. fish fillet and chips at McDonald's, a black coffee"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    autoFocus
                    style={{
                      backgroundColor: colors.bgInput,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: text.length > 0 ? colors.primary : colors.border,
                      padding: 14,
                      color: '#fff',
                      fontSize: fontSize.md,
                      minHeight: 100,
                      textAlignVertical: 'top',
                    }}
                    editable={!isBusy}
                  />

                  {error && (
                    <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>{error}</Text>
                  )}

                  <TouchableOpacity
                    onPress={handleParse}
                    disabled={!text.trim() || isBusy}
                    style={{
                      backgroundColor: text.trim() && !isBusy ? colors.primary : colors.bgCard,
                      borderRadius: radius.md,
                      padding: 15,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                      borderWidth: 1,
                      borderColor: text.trim() && !isBusy ? 'transparent' : colors.border,
                    }}
                  >
                    {stage === 'parsing' ? (
                      <>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: fontSize.md }}>
                          Analyzing...
                        </Text>
                      </>
                    ) : (
                      <Text style={{
                        color: text.trim() ? '#0a0a0a' : colors.textMuted,
                        fontWeight: '800',
                        fontSize: fontSize.md,
                      }}>
                        Analyze with AI ✦
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* PREVIEW / SAVING STAGE */}
              {(stage === 'preview' || stage === 'saving') && (
                <View style={{ gap: 12 }}>
                  {/* Original input */}
                  <View style={{
                    backgroundColor: colors.bgCard, borderRadius: radius.md,
                    borderWidth: 1, borderColor: colors.border,
                    padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start',
                  }}>
                    <Text style={{ fontSize: 16 }}>💬</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1, lineHeight: 20 }}>
                      "{text}"
                    </Text>
                  </View>

                  {/* Parsed items list */}
                  <View style={{
                    backgroundColor: colors.bgCard, borderRadius: radius.md,
                    borderWidth: 1, borderColor: colors.border,
                    overflow: 'hidden',
                  }}>
                    {items.map((item, i) => (
                      <View key={i} style={{
                        flexDirection: 'row', alignItems: 'center',
                        paddingVertical: 12, paddingHorizontal: 14,
                        borderBottomWidth: i < items.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                        gap: 10,
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.sm }}>
                            {item.name}
                          </Text>
                          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                            {item.quantity} {item.unit}
                            {'  ·  '}{item.protein}g P{'  '}{item.carbs}g C{'  '}{item.fat}g F
                          </Text>
                        </View>
                        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: fontSize.sm }}>
                          {Math.round(item.calories)} kcal
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={{
                    backgroundColor: colors.primaryLight,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: `${colors.primary}30`,
                    padding: 14,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.sm }}>Total</Text>
                      <Text style={{ color: colors.primary, fontWeight: '900', fontSize: fontSize.lg }}>
                        {totalCalories} kcal
                      </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 }}>
                      P {totalProtein}g  ·  C {totalCarbs}g  ·  F {totalFat}g
                    </Text>
                  </View>

                  {error && (
                    <Text style={{ color: colors.danger, fontSize: fontSize.xs }}>{error}</Text>
                  )}

                  <TouchableOpacity
                    onPress={handleLog}
                    disabled={stage === 'saving'}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: radius.md,
                      padding: 15,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {stage === 'saving'
                      ? <ActivityIndicator size="small" color="#0a0a0a" />
                      : <Text style={{ color: '#0a0a0a', fontWeight: '900', fontSize: fontSize.md }}>
                          Log {items.length} item{items.length !== 1 ? 's' : ''}
                        </Text>
                    }
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => { setStage('input'); setError(null) }}
                    disabled={stage === 'saving'}
                    style={{ alignItems: 'center', paddingVertical: 8 }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                      Edit description
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}
