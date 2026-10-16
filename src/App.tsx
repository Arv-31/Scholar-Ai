import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'
import RootRedirect from './components/RootRedirect'

// Each page is downloaded only when it is first opened (code-splitting = faster first load).
const Login = lazy(() => import('./pages/Login'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const DefaultHome = lazy(() => import('./pages/DefaultHome'))
const ExamHome = lazy(() => import('./pages/ExamHome'))
const UnitPage = lazy(() => import('./pages/UnitPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const MistakesPage = lazy(() => import('./pages/MistakesPage'))
const MockTestPage = lazy(() => import('./pages/MockTestPage'))

// Browser tab title for each page, e.g. "Quiz · ScholarAI".
const TITLES: [RegExp, string][] = [
  [/^\/login/, 'Sign in'],
  [/^\/reset-password/, 'Reset password'],
  [/^\/default/, 'Today'],
  [/^\/exam\/unit\/[^/]+\/quiz/, 'Quiz'],
  [/^\/exam\/unit/, 'Unit'],
  [/^\/exam\/chat/, 'Ask AI'],
  [/^\/exam\/mistakes/, 'Mistakes'],
  [/^\/exam\/mock/, 'Mock test'],
  [/^\/exam/, 'Subjects'],
  [/^\/progress/, 'Progress'],
  [/^\/settings/, 'Settings'],
]

function PageTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const title = TITLES.find(([pattern]) => pattern.test(pathname))?.[1]
    document.title = title ? `${title} · ScholarAI` : 'ScholarAI'
  }, [pathname])
  return null
}

// Every route in the app, in one place.
export default function App() {
  return (
    <>
      <PageTitle />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Everything below needs a logged-in student */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RootRedirect />} />
            <Route element={<AppShell />}>
              {/* Default mode */}
              <Route path="/default" element={<DefaultHome />} />

              {/* Exam mode */}
              <Route path="/exam" element={<ExamHome />} />
              <Route path="/exam/unit/:unitId" element={<UnitPage />} />
              <Route path="/exam/unit/:unitId/quiz/:round" element={<QuizPage />} />
              <Route path="/exam/chat" element={<ChatPage />} />
              <Route path="/exam/mistakes" element={<MistakesPage />} />
              <Route path="/exam/mock" element={<MockTestPage />} />

              {/* Shared */}
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
