import { useContext } from 'react'
import { AuthContext } from '../context/auth'

// Any screen can call useAuth() to know who is logged in.
export function useAuth() {
  return useContext(AuthContext)
}
