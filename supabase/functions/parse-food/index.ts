import { verifyAndRateLimit } from '../_shared/rateLimit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FoodItem {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authResult = await verifyAndRateLimit(req, 'parse-food')
  if (authResult instanceof Response) return authResult

  try {
    const { rawInput } = await req.json()

    if (!rawInput?.trim()) {
      return new Response(
        JSON.stringify({ error: 'rawInput is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not configured')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: `You are a precise nutrition analyst. Parse food descriptions into individual items with accurate calorie and macro data.

Rules:
- Identify EVERY distinct food item mentioned
- For restaurant foods (McDonald's, Subway, KFC, etc.), use their actual published nutrition when known
- For vague portions ("small", "large", "mini"), use the smaller/standard restaurant size
- If quantity is ambiguous, use a reasonable standard serving
- Calories = whole number, protein/carbs/fat = 1 decimal place
- "chips" at a fast food place = small fries unless stated otherwise
- "coffee" = standard 240ml black coffee unless stated otherwise`,
        tools: [{
          name: 'log_food_items',
          description: 'Return all parsed food items with their nutrition data',
          input_schema: {
            type: 'object',
            required: ['items'],
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'quantity', 'unit', 'calories', 'protein', 'carbs', 'fat'],
                  properties: {
                    name: { type: 'string', description: 'Specific food name, e.g. "Filet-O-Fish" not just "sandwich"' },
                    quantity: { type: 'number' },
                    unit: { type: 'string', description: 'e.g. piece, g, ml, cup, oz' },
                    calories: { type: 'number' },
                    protein: { type: 'number' },
                    carbs: { type: 'number' },
                    fat: { type: 'number' },
                    fiber: { type: 'number' },
                  }
                }
              }
            }
          }
        }],
        tool_choice: { type: 'tool', name: 'log_food_items' },
        messages: [{ role: 'user', content: rawInput }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Claude API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    const toolUse = data.content?.find((c: { type: string }) => c.type === 'tool_use')

    if (!toolUse?.input?.items) {
      throw new Error('No food items returned from Claude')
    }

    const items: FoodItem[] = toolUse.input.items

    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[parse-food] Error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
