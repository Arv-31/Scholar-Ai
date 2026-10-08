import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import { signIn, signInWithGoogle, signUp } from '../services/authService'

const FEATURES = [
  { text: 'Unit-by-unit exam progress', dot: 'bg-green' },
  { text: 'Quizzes, videos and an AI tutor', dot: 'bg-green' },
  { text: 'Two small challenges a day', dot: 'bg-ember' },
]

export default function Login() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (loading) return <LoadingScreen />
  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    const result = isSignUp ? await signUp(email, password) : await signIn(email, password)

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (isSignUp) {
      setMessage('Check your email to confirm your account, then sign in.')
      setIsSignUp(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    const result = await signInWithGoogle()
    if (result.error) setError(result.error)
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel: a short header on mobile, the full left half on desktop */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-ink px-6 py-8 text-white sm:px-10 lg:p-14">
        <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-[0.06]" />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-green/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-ember/20 blur-3xl"
        />

        <div className="relative">
          <Logo tone="light" />
        </div>

        <div className="relative mt-10 lg:mt-0">
          <p className="eyebrow text-white/50!">Entrance prep · Habit building</p>
          <h1 className="mt-3 max-w-xl text-3xl leading-tight font-medium sm:text-4xl lg:text-5xl">
            Prepare for NIMCET, PGCET-MCA and MBA, and build the habits that keep you going.
          </h1>
          <ul className="mt-8 hidden space-y-3 text-sm text-white/70 sm:block">
            {FEATURES.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3">
                <span className={`h-1.5 w-1.5 rounded-full ${feature.dot}`} />
                {feature.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative hidden text-xs text-white/40 lg:block">ScholarAI · BCA project</p>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="card w-full max-w-sm p-7 shadow-[0_24px_60px_-30px_rgb(18_21_27/0.35)] sm:p-8">
          <p className="eyebrow">{isSignUp ? 'New here' : 'Welcome back'}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {isSignUp ? 'Create account' : 'Sign in'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {isSignUp ? 'Takes less than a minute.' : 'Pick up where you left off.'}
          </p>

          <button
            type="button"
            onClick={() => void handleGoogle()}
            className="btn-ghost mt-7 w-full gap-3! py-3!"
          >
            <GoogleMark />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or with email
            <span className="h-px flex-1 bg-line" />
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Email</span>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Password</span>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-xl bg-green-soft px-3 py-2.5 text-sm text-green">{message}</p>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={submitting}>
              {submitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="cursor-pointer font-medium text-ink underline decoration-green decoration-2 underline-offset-4"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}
