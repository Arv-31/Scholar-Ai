import { FunctionsHttpError } from '@supabase/supabase-js'
import type { z } from 'zod'
import { supabase } from '../lib/supabaseClient'

// An error the screens can show as-is. `code` lets a screen react, e.g. NO_KEY -> link to Settings.
export class AppError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

// Calls one of our Edge Functions and checks the answer's shape with Zod.
export async function callFunction<T>(
  name: string,
  body: Record<string, unknown>,
  schema: z.ZodType<T>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body })

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null)
      if (payload?.error?.code) throw new AppError(payload.error.code, payload.error.message)
    }
    throw new AppError('NETWORK', 'Could not reach the server. Check your connection.')
  }

  const parsed = schema.safeParse(data)
  if (!parsed.success) throw new AppError('BAD_RESPONSE', 'Got an unexpected answer. Please try again.')
  return parsed.data
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.'
}
