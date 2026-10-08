import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getMyProfile } from '../services/profileService'
import LoadingScreen from './LoadingScreen'

// "/" sends the student back to the mode they used last (Default if unknown).
export default function RootRedirect() {
  const [target, setTarget] = useState<string | null>(null)

  useEffect(() => {
    getMyProfile().then((profile) => {
      setTarget(profile?.mode === 'exam' ? '/exam' : '/default')
    })
  }, [])

  if (!target) return <LoadingScreen />
  return <Navigate to={target} replace />
}
