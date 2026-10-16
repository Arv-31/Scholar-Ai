import { z } from 'zod'

// Form checks for login, sign-up and reset password, kept in one place so all three agree.
// Supabase checks again on the server; these only give a clear message before sending.

export const MIN_PASSWORD = 8

const email = z.string().trim().email('Enter a valid email address.')
const newPassword = z.string().min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters.`)

// Signing in: older accounts may have shorter passwords, so only "not empty" is checked.
export const SignInForm = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
})

export const SignUpForm = z.object({ email, password: newPassword })

export const NewPasswordForm = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: 'The two passwords do not match.' })

// Returns the first problem as a sentence, or null when the form is fine.
export function firstProblem(schema: z.ZodType, value: unknown): string | null {
  const checked = schema.safeParse(value)
  return checked.success ? null : checked.error.issues[0].message
}
