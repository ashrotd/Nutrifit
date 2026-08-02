import { createClient } from '@supabase/supabase-js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

const PLAN_TOOL = {
  name: 'create_workout_plan',
  description: 'Return a structured weekly workout plan.',
  input_schema: {
    type: 'object',
    required: ['name', 'days'],
    properties: {
      name: { type: 'string' },
      days: {
        type: 'array',
        items: {
          type: 'object',
          required: ['day_number', 'name', 'muscle_groups', 'is_rest', 'exercises'],
          properties: {
            day_number:    { type: 'integer' },
            name:          { type: 'string' },
            muscle_groups: { type: 'array', items: { type: 'string' } },
            is_rest:       { type: 'boolean' },
            exercises: {
              type: 'array',
              items: {
                type: 'object',
                required: ['order_index','name','sets','reps','rest_seconds',
                           'muscle_primary','muscles_secondary','why','tips','alternatives'],
                properties: {
                  order_index:       { type: 'integer' },
                  name:              { type: 'string' },
                  sets:              { type: 'integer' },
                  reps:              { type: 'string' },
                  rest_seconds:      { type: 'integer' },
                  muscle_primary:    { type: 'string' },
                  muscles_secondary: { type: 'array', items: { type: 'string' } },
                  why:               { type: 'string' },
                  tips:              { type: 'string' },
                  alternatives: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['name', 'reason'],
                      properties: {
                        name:   { type: 'string' },
                        reason: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  // Auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  const { goal, workout_type, selected_days, experience, equipment, age, sex, weight_kg } = await req.json()

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthropicKey) return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)

  const isBeginnerReps = experience === 'beginner'
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const trainingDayNames = (selected_days as number[]).map(d => DAY_NAMES[d - 1]).join(', ')

  const profileLines = [
    age      ? `• Age: ${age} years` : null,
    sex      ? `• Sex: ${sex}` : null,
    weight_kg ? `• Weight: ${weight_kg} kg` : null,
  ].filter(Boolean).join('\n')

  const prompt = `Design a workout programme for:
• Goal: ${goal}
• Style: ${workout_type}
• Experience: ${experience}
• Equipment: ${equipment}
• Training days: ${trainingDayNames} (day numbers: ${(selected_days as number[]).join(', ')})
${profileLines}

Rules:
- Return exactly 7 day entries (day_number 1–7, where 1=Mon and 7=Sun).
- Training days are ONLY day numbers: ${(selected_days as number[]).join(', ')}. All other days must have is_rest: true and an empty exercises array.
- Reps: ${isBeginnerReps ? 'use specific ranges like "8-12" or "12-15" — beginners need clear targets' : 'set reps to "failure" — intermediate/advanced push till they cannot do another rep'}
- For each exercise write a clear "why" (1–2 sentences on its role in the programme) and one key "tips" form cue.
- Provide exactly 2 alternatives per exercise: one for missing equipment, one for an easier variation or injury mod.
- Choose exercises suited to ${equipment === 'full_gym' ? 'a commercial gym with barbells, cables, machines' : equipment === 'home' ? 'home training with dumbbells and bodyweight' : 'minimal equipment — bodyweight and resistance bands'}.
- rest_seconds: 90 for hypertrophy, 180 for strength, 60 for endurance/cardio circuits.
${age && age > 40 ? '- User is over 40: prioritise joint-friendly movements, include mobility work, allow extra rest days.' : ''}
${weight_kg && weight_kg > 100 ? '- User is over 100 kg: choose low-impact alternatives where relevant (e.g. trap bar over straight bar deadlift).' : ''}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 8000,
        tools: [PLAN_TOOL],
        tool_choice: { type: 'tool', name: 'create_workout_plan' },
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) return json({ error: data.error?.message ?? 'Claude error' }, 500)

    const toolBlock = data.content?.find((b: { type: string }) => b.type === 'tool_use')
    if (!toolBlock) return json({ error: 'Plan generation failed' }, 500)

    return json(toolBlock.input)
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
})
