import { lazy, Suspense, useCallback, useRef, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen'
import type { ArcherPhase, Point } from '../components/login/ArcherScene'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import { firstProblem, MIN_PASSWORD, SignInForm, SignUpForm } from '../lib/authSchemas'
import { clearLanding, setLanding } from '../lib/landing'
import { sendPasswordReset, signIn, signInWithGoogle, signUp } from '../services/authService'

// The night-hill scene loads after the form, so the form is usable straight away.
const ArcherScene = lazy(() => import('../components/login/ArcherScene'))

export default function Login() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [forgot, setForgot] = useState(false) // "Forgot password?" mode: email only
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [phase, setPhase] = useState<ArcherPhase>('idle')
  const [holding, setHolding] = useState(false) // stay here while the success shot plays
  const [cardFx, setCardFx] = useState<'' | 'card-shake' | 'card-dissolve'>('')
  const cardRef = useRef<HTMLDivElement>(null)
  const left = useRef(false)

  const goHome = useCallback(() => {
    if (left.current) return
    left.current = true
    navigate('/', { replace: true })
  }, [navigate])

  // The archer aims a little above the card's middle.
  const getTarget = useCallback((): Point | null => {
    const box = cardRef.current?.getBoundingClientRect()
    return box ? { x: box.left + box.width / 2, y: box.top + box.height * 0.4 } : null
  }, [])

  // Celestial arrow hit the card: it dissolves into the blast of light.
  const handleImpact = useCallback(() => setCardFx('card-dissolve'), [])

  // After the 1.5 s blast the screen is pure light; the home page opens out of it from that point.
  const handleBlastDone = useCallback(
    (point: Point) => {
      setLanding({ x: point.x, y: point.y, bright: true })
      goHome()
    },
    [goHome],
  )

  if (loading) return <LoadingScreen />
  if (session && !holding) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    const problem = firstProblem(isSignUp ? SignUpForm : SignInForm, { email, password })
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    setSubmitting(true)
    setHolding(true)
    setPhase('drawing') // he draws the bow while we wait for Supabase

    const result = isSignUp ? await signUp(email, password) : await signIn(email, password)

    setSubmitting(false)

    if (result.error) {
      setHolding(false)
      setError(result.error)
      setPhase('fail') // bow lowers, card shakes, no celestial arrow
      setCardFx('card-shake')
      window.setTimeout(() => setPhase('idle'), 700)
      return
    }

    // Sign-up that still needs the email confirmed: no login yet, so no celestial arrow.
    if (isSignUp && !('signedIn' in result && result.signedIn)) {
      setHolding(false)
      setPhase('idle')
      setMessage('Check your email to confirm your account, then sign in.')
      setIsSignUp(false)
      return
    }

    // Login (or sign-up) confirmed by the server: only now does the celestial arrow appear.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLanding({ fade: true })
      goHome()
      return
    }
    setPhase('success')
    window.setTimeout(() => {
      // safety net if the animation could not run (e.g. the tab was hidden)
      setLanding({ fade: true })
      goHome()
    }, 6000)
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)
    const result = await sendPasswordReset(email)
    setSubmitting(false)
    if (result.error) setError(result.error)
    else setMessage('If that email has an account, a reset link is on its way. Check your inbox.')
  }

  async function handleGoogle() {
    setError(null)
    setLanding({}) // play the landing reveal (from the centre) when Google sends us back
    const result = await signInWithGoogle()
    if (result.error) {
      clearLanding()
      setError(result.error)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060a16] text-[#edebe3]">
      <Suspense fallback={null}>
        <ArcherScene
          phase={phase}
          getTarget={getTarget}
          onImpact={handleImpact}
          onBlastDone={handleBlastDone}
        />
      </Suspense>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Logo tone="light" />
        <p className="hidden text-xs text-white/45 sm:block">Tap the sky</p>
      </header>

      {/* Card sits centre-left so the archer's line of sight crosses it */}
      <main className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center px-4 pb-16 sm:px-10 lg:pl-[9vw] short:pb-6">
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <p className="eyebrow text-white/50!">Entrance prep · Habit building</p>
          <h1 className="mt-2 text-3xl leading-tight font-medium text-white sm:text-4xl lg:w-[30rem]">
            Prepare for NIMCET, PGCET-MCA and MBA.
          </h1>

          <div
            ref={cardRef}
            data-no-arrows
            className={`card mt-6 p-7 text-ink sm:p-8 short:mt-4 short:p-6 ${cardFx}`}
            style={{ boxShadow: '6px 6px 0 rgb(239 234 219 / 0.22)' }}
            onAnimationEnd={() => cardFx === 'card-shake' && setCardFx('')}
          >
            {forgot ? (
              <>
                <p className="eyebrow">Forgot password</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Reset it</h2>
                <p className="mt-1 text-sm text-muted">
                  We will email you a link to choose a new password.
                </p>
                <form className="mt-7 flex flex-col gap-4" onSubmit={handleForgot}>
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
                  {error && (
                    <p role="alert" className="bg-danger-soft px-3 py-2.5 text-sm text-danger">
                      {error}
                    </p>
                  )}
                  {message && (
                    <p role="status" className="bg-green-soft px-3 py-2.5 text-sm text-green">
                      {message}
                    </p>
                  )}
                  <button type="submit" className="btn-primary mt-2" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
                <p className="mt-6 text-center text-sm text-muted">
                  <button
                    type="button"
                    className="cursor-pointer font-medium text-ink underline decoration-green decoration-2 underline-offset-4"
                    onClick={() => {
                      setForgot(false)
                      setError(null)
                      setMessage(null)
                    }}
                  >
                    Back to sign in
                  </button>
                </p>
              </>
            ) : (
              <>
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
                  className="btn-ghost mt-7 w-full gap-3! py-3! short:mt-5 short:py-2.5!"
                >
                  <GoogleMark />
                  Continue with Google
                </button>

                <div className="my-5 flex items-center gap-3 text-xs text-muted short:my-3">
                  <span className="h-px flex-1 bg-line" />
                  or with email
                  <span className="h-px flex-1 bg-line" />
                </div>

                <form className="flex flex-col gap-4 short:gap-3" onSubmit={handleSubmit}>
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
                      minLength={isSignUp ? MIN_PASSWORD : undefined}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    />
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="-mt-2 cursor-pointer self-end text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
                      onClick={() => {
                        setForgot(true)
                        setError(null)
                        setMessage(null)
                      }}
                    >
                      Forgot password?
                    </button>
                  )}

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger"
                    >
                      {error}
                    </p>
                  )}
                  {message && (
                    <p className="rounded-xl bg-green-soft px-3 py-2.5 text-sm text-green">
                      {message}
                    </p>
                  )}

                  <button type="submit" className="btn-primary mt-2" disabled={submitting}>
                    {submitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted short:mt-4">
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}
