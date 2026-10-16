import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import { NewPasswordForm } from '../lib/authSchemas'
import { updatePassword } from '../services/authService'

// Opened from the "reset password" email. Supabase signs the student in from the link,
// so all that is left is choosing the new password.
export default function ResetPasswordPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (loading) return <LoadingScreen />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const checked = NewPasswordForm.safeParse({ password, confirm })
    if (!checked.success) {
      setError(checked.error.issues[0].message)
      return
    }
    setSaving(true)
    setError(null)
    const result = await updatePassword(checked.data.password)
    setSaving(false)
    if (result.error) setError(result.error)
    else navigate('/', { replace: true })
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Logo />
        <div className="card mt-6 p-7 sm:p-8">
          <p className="eyebrow">Reset password</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose a new one</h1>
          {!session ? (
            <>
              <p className="mt-3 text-sm text-muted">
                This reset link has expired or was already used. Ask for a new one from the sign-in
                page.
              </p>
              <Link to="/login" className="btn-primary mt-6 w-full">
                Back to sign in
              </Link>
            </>
          ) : (
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">New password</span>
                <input
                  className="field"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Type it again</span>
                <input
                  className="field"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
              {error && (
                <p role="alert" className="bg-danger-soft px-3 py-2.5 text-sm text-danger">
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary mt-2" disabled={saving}>
                {saving ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
