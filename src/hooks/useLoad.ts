import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../services/functionsClient'

type State<T> = { key: string; data: T | null; error: unknown }

// Runs `load` when the page opens (and again whenever `key` changes).
// Gives back { data, error, loading, reload, setData } so every page handles states the same way.
export function useLoad<T>(load: () => Promise<T>, key = '') {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<State<T>>({ key: '', data: null, error: null })
  const requestKey = `${key}#${version}`

  useEffect(() => {
    let active = true
    load().then(
      (data) => active && setState({ key: requestKey, data, error: null }),
      (error: unknown) => active && setState({ key: requestKey, data: null, error }),
    )
    return () => {
      active = false
    }
    // `load` is a new function on every render; we only re-run when the key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const sameKey = state.key.startsWith(`${key}#`)
  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const setData = useCallback(
    (data: T) => setState((current) => ({ ...current, data })),
    [],
  )

  return {
    data: sameKey ? state.data : null,
    error: sameKey && state.error ? errorMessage(state.error) : null,
    errorCode:
      sameKey && state.error && typeof state.error === 'object' && 'code' in state.error
        ? String(state.error.code)
        : null,
    loading: state.key !== requestKey,
    reload,
    setData,
  }
}
