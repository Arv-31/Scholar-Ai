// Lets the browser app call our Edge Functions.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// A "known" error the app can show to the student, e.g. { code: 'NO_KEY', message: '...' }
export function fail(code: string, message: string, status = 400): Response {
  return json({ error: { code, message } }, status)
}
