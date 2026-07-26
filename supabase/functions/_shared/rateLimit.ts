import { createClient } from '@supabase/supabase-js'

const DAILY_LIMITS: Record<string, number> = {
  'parse-food': 20,
  'scan-food':  10,
}

export async function verifyAndRateLimit(
  req: Request,
  endpoint: keyof typeof DAILY_LIMITS,
): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Count today's food_logs for this user — each AI call creates one
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('food_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00`)

  const limit = DAILY_LIMITS[endpoint]
  if ((count ?? 0) >= limit) {
    return new Response(
      JSON.stringify({ error: `Daily limit of ${limit} AI calls reached. Try again tomorrow.` }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return { userId: user.id }
}
