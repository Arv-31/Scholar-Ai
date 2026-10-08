import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSession, onAuthChange } from '../services/authService'
import { AuthContext } from './auth'

// Wraps the whole app and keeps the current login session up to date.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession().then((current) => {
      setSession(current)
      setLoading(false)
    })

    return onAuthChange((next) => {
      setSession(next)
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
