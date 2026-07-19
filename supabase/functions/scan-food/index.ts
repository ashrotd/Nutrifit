const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, mediaType } = await req.json()

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 is required' }),
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
        system: `You are a precise nutrition analyst. Identify every food and drink item visible in the image and provide accurate nutrition data per item using the log_food_items tool.

Rules:
- Identify ALL visible food/drink items, including condiments, garnishes, and side items
- Estimate portion sizes based on visual context (plate size, cup size, etc.)
- For branded/restaurant items, use their published nutrition data when identifiable
- Round calories to whole number, macros to 1 decimal
- If a food is unclear, make a reasonable best guess`,
        tools: [{
          name: 'log_food_items',
          description: 'Return all food items identified in the image with nutrition data',
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
                    name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
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
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'What food items are in this image? Identify everything and provide nutritional information.',
            },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Claude API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    const toolUse = data.content?.find((c: { type: string }) => c.type === 'tool_use')

    if (!toolUse?.input?.items) {
      throw new Error('Could not identify food items in image')
    }

    return new Response(
      JSON.stringify({ items: toolUse.input.items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
