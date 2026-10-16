// Saves or removes the student's own Gemini key.
// The full key goes into user_secrets (browser can never read it).
// The profile only gets a masked hint like "AIza…x9Qk".
import { z } from 'npm:zod@4'
import { GEMINI_MODEL } from '../_shared/aiRouting.ts'
import { admin, getUser } from '../_shared/auth.ts'
import { corsHeaders, fail, json } from '../_shared/cors.ts'
import { classifyGeminiError } from '../_shared/geminiErrors.ts'
import { checkGeminiKey } from '../_shared/providers/gemini.ts'

const Input = z.discriminatedUnion('action', [
  z.object({ action: z.literal('save'), key: z.string().trim().min(30).max(100) }),
  z.object({ action: z.literal('remove') }),
])

function maskKey(key: string): string {
  return `${key.slice(0, 4)}…${key.slice(-4)}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const user = await getUser(req)
  if (!user) return fail('UNAUTHORIZED', 'Please sign in again.', 401)

  const parsed = Input.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('BAD_INPUT', 'That does not look like a Gemini key.')

  if (parsed.data.action === 'remove') {
    const removed = await admin.from('user_secrets').delete().eq('user_id', user.id)
    const cleared = await admin.from('profiles').update({ gemini_key_hint: null }).eq('id', user.id)
    if (removed.error || cleared.error) {
      console.error('gemini-key remove failed:', removed.error?.message ?? cleared.error?.message)
      return fail('SAVE_FAILED', 'Could not remove the key. Try again.', 500)
    }
    return json({ hint: null })
  }

  // Try the key with a tiny real request to the model the app uses.
  const key = parsed.data.key
  const problem = await checkGeminiKey(key, GEMINI_MODEL)
  if (problem) {
    const failure = classifyGeminiError(problem)
    // A key that only hit its rate limit, or met a busy Google, is still a real key, so we save it.
    if (failure.code !== 'RATE_LIMIT' && failure.code !== 'BUSY') {
      return fail(failure.code, failure.message, failure.httpStatus)
    }
  }

  const hint = maskKey(key)
  const saved = await admin
    .from('user_secrets')
    .upsert({ user_id: user.id, gemini_api_key: key, updated_at: new Date().toISOString() })
  if (saved.error) {
    console.error('gemini-key save failed:', saved.error.message)
    return fail('SAVE_FAILED', 'Could not save the key. Try again.', 500)
  }

  const hinted = await admin.from('profiles').update({ gemini_key_hint: hint }).eq('id', user.id)
  if (hinted.error) {
    console.error('gemini-key hint failed:', hinted.error.message)
    return fail('SAVE_FAILED', 'The key was saved but Settings could not be updated. Try again.', 500)
  }
  return json({ hint })
})
