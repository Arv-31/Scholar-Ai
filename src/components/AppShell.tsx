import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { ShellContext } from '../hooks/useShell'
import { signOut } from '../services/authService'
import { getMyProfile, updateMyMode } from '../services/profileService'
import type { Mode, Profile } from '../types/database'
import Logo from './Logo'
import ModeToggle from './ModeToggle'

// Menu items for each mode.
const NAV: Record<Mode, { to: string; label: string }[]> = {
  default: [
    { to: '/default', label: 'Today' },
    { to: '/progress', label: 'Progress' },
    { to: '/settings', label: 'Settings' },
  ],
  exam: [
    { to: '/exam', label: 'Subjects' },
    { to: '/exam/chat', label: 'Ask AI' },
    { to: '/progress', label: 'Progress' },
    { to: '/settings', label: 'Settings' },
  ],
}

// 'Subjects' stays highlighted inside a unit or quiz page.
function isActive(to: string, pathname: string): boolean {
  if (to === '/exam') return pathname === '/exam' || pathname.startsWith('/exam/unit')
  return pathname === to
}

// The frame around every logged-in page:
// desktop = sidebar on the left, mobile = top bar + floating bottom menu.
export default function AppShell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [savedMode, setSavedMode] = useState<Mode>('default')

  const refreshProfile = useCallback(() => {
    getMyProfile().then((loaded) => {
      if (!loaded) return
      setProfile(loaded)
      setSavedMode(loaded.mode)
    })
  }, [])

  useEffect(refreshProfile, [refreshProfile])

  // /exam pages are Exam mode, /default is Default mode, shared pages keep the last mode.
  const pathMode: Mode | null = pathname.startsWith('/exam')
    ? 'exam'
    : pathname.startsWith('/default')
      ? 'default'
      : null
  const mode = pathMode ?? savedMode

  function handleModeChange(next: Mode) {
    setSavedMode(next)
    void updateMyMode(next)
    navigate(next === 'exam' ? '/exam' : '/default')
  }

  const context: ShellContext = {
    mode,
    displayName: profile?.display_name ?? user?.email?.split('@')[0] ?? 'there',
    profile,
    setProfile,
    refreshProfile,
  }

  // The theme in index.css follows this: <html data-mode="exam"> = blackboard, "default" = paper.
  useEffect(() => {
    document.documentElement.dataset.mode = mode
    return () => {
      document.documentElement.dataset.mode = 'default' // back to paper on the login page
    }
  }, [mode])

  // useOutlet (not <Outlet />) so the old page can stay on screen while it fades out.
  const page = useOutlet(context)

  const accent = mode === 'exam' ? 'bg-green' : 'bg-ember'
  const accentBorder = mode === 'exam' ? 'border-green' : 'border-ember'

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-ink bg-surface px-5 py-6 lg:flex">
          <Logo />
          <div className="mt-8">
            <ModeToggle mode={mode} onChange={handleModeChange} />
          </div>
          <p className="eyebrow mt-10 mb-3 px-3">Menu</p>
          <nav className="flex flex-col gap-1">
            {NAV[mode].map((item) => {
              const active = isActive(item.to, pathname)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`border-l-4 px-3 py-2 text-sm transition ${
                    active
                      ? `${accentBorder} font-semibold text-ink`
                      : 'border-transparent font-medium text-muted hover:border-line hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-auto cursor-pointer border-l-4 border-transparent px-3 py-2 text-left text-sm text-muted transition hover:text-ink"
          >
            Sign out
          </button>
        </aside>

        <div className="flex min-w-0 flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink bg-paper px-4 py-3 lg:hidden">
            <Logo />
            <ModeToggle mode={mode} onChange={handleModeChange} />
          </header>

          <main className="w-full max-w-5xl px-4 pt-6 pb-28 sm:px-8 lg:px-12 lg:py-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {page}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile floating bottom menu */}
        <nav className="fixed inset-x-3 bottom-3 z-10 flex justify-around gap-1 rounded-md border border-ink bg-board p-1.5 shadow-[3px_3px_0_var(--color-ink)] lg:hidden">
          {NAV[mode].map((item) => {
            const active = isActive(item.to, pathname)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`flex-1 rounded-sm py-2.5 text-center text-sm font-medium transition ${
                  active ? `${accent} text-on-accent` : 'text-white/60'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </MotionConfig>
  )
}
