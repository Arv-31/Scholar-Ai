import { useOutletContext } from 'react-router-dom'
import type { Mode, Profile } from '../types/database'

export type ShellContext = {
  displayName: string
  mode: Mode
  profile: Profile | null
  // Call after something changes the profile (exam, key, streak) so every page sees it.
  setProfile: (profile: Profile) => void
  refreshProfile: () => void
}

// Pages inside AppShell call this to get the student's profile and current mode.
export function useShell() {
  return useOutletContext<ShellContext>()
}
