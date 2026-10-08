// Saves or removes the student's own Gemini key.
// The full key goes into user_secrets (browser can never read it).
// The profile only gets a masked hint like "AIza…x9Qk".
import { z } from 'npm:zod@4'
import { admin, getUser } from '../_shared/auth.ts'
import { corsHeaders, fail, json } from '../_shared/cors.ts'
import { isGeminiKeyValid } from '../_shared/providers/gemini.ts'

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
    await admin.from('user_secrets').delete().eq('user_id', user.id)
    await admin.from('profiles').update({ gemini_key_hint: null }).eq('id', user.id)
    return json({ hint: null })
  }

  const key = parsed.data.key
  if (!(await isGeminiKeyValid(key))) {
    return fail('BAD_KEY', 'Google did not accept this key. Copy it again from AI Studio.')
  }

  const hint = maskKey(key)
  const { error } = await admin
    .from('user_secrets')
    .upsert({ user_id: user.id, gemini_api_key: key, updated_at: new Date().toISOString() })
  if (error) return fail('SAVE_FAILED', 'Could not save the key. Try again.', 500)

  await admin.from('profiles').update({ gemini_key_hint: hint }).eq('id', user.id)
  return json({ hint })
})
