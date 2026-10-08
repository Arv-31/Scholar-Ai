import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2'

// Server-only Supabase client. It skips RLS, so only use it after checking who the user is.
export const admin: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

// Reads the student's login token from the request. Returns null if it is missing or invalid.
export async function getUser(req: Request): Promise<User | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data, error } = await admin.auth.getUser(token)
  if (error) return null
  return data.user
}

// The student's own Gemini key (never sent back to the browser).
export async function getGeminiKey(userId: string): Promise<string | null> {
  const { data } = await admin
    .from('user_secrets')
    .select('gemini_api_key')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.gemini_api_key ?? null
}
