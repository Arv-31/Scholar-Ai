import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import RootRedirect from './components/RootRedirect'
import ChatPage from './pages/ChatPage'
import DefaultHome from './pages/DefaultHome'
import ExamHome from './pages/ExamHome'
import Login from './pages/Login'
import ProgressPage from './pages/ProgressPage'
import QuizPage from './pages/QuizPage'
import SettingsPage from './pages/SettingsPage'
import UnitPage from './pages/UnitPage'

// Every route in the app, in one place.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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

          {/* Shared */}
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
