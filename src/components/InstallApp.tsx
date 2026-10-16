import { useState, useSyncExternalStore } from 'react'
import { canInstall, isInstalled, isIos, promptInstall, subscribeInstall } from '../lib/installApp'

// "Install ScholarAI" card: an Install button on Android/Chrome/Edge, Share-sheet steps on iPhone.
// Hidden when the app is already installed or the browser cannot install it.
export default function InstallApp() {
  const available = useSyncExternalStore(subscribeInstall, canInstall)
  const [installed] = useState(isInstalled)
  const [ios] = useState(isIos)

  if (installed || (!available && !ios)) return null

  return (
    <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
      <div className="max-w-md">
        <h2 className="text-lg font-semibold">Install the app</h2>
        <p className="mt-1 text-sm text-muted">
          {ios
            ? 'On iPhone: tap the Share button in Safari, then "Add to Home Screen".'
            : 'Add ScholarAI to your home screen. It opens full screen, like any other app.'}
        </p>
      </div>
      {!ios && (
        <button type="button" onClick={() => void promptInstall()} className="btn-primary">
          Install ScholarAI
        </button>
      )}
    </section>
  )
}
