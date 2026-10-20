import { useState, useSyncExternalStore } from 'react'
import {
  canInstall,
  isAndroid,
  isInstalled,
  isIos,
  promptInstall,
  subscribeInstall,
} from '../lib/installApp'

// "Install ScholarAI" card: an Install button when the browser offers one, otherwise the
// browser-menu steps. The browser's own popup works only once per page load, so after a
// cancelled install the card stays and shows the manual steps instead of disappearing.
export default function InstallApp() {
  const available = useSyncExternalStore(subscribeInstall, canInstall)
  const [installed] = useState(isInstalled)
  const [ios] = useState(isIos)
  const [android] = useState(isAndroid)

  if (installed) return null

  let steps =
    'In Chrome or Edge: click the install icon at the right end of the address bar, or open the browser menu (⋮ or …) and choose "Install ScholarAI" / "Install this site as an app".'
  if (ios) steps = 'On iPhone: tap the Share button in Safari, then "Add to Home Screen".'
  else if (android)
    steps = 'In Chrome: tap the ⋮ menu at the top right, then "Add to home screen" → "Install".'
  if (available && !ios)
    steps = 'Add ScholarAI to your home screen. It opens full screen, like any other app.'

  return (
    <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
      <div className="max-w-md">
        <h2 className="text-lg font-semibold">Install the app</h2>
        <p className="mt-1 text-sm text-muted">{steps}</p>
        {!available && !ios && (
          <p className="mt-2 text-xs text-muted">
            Cancelled an install? Use the steps above, or reload this page to get the button back.
          </p>
        )}
      </div>
      {available && !ios && (
        <button type="button" onClick={() => void promptInstall()} className="btn-primary">
          Install ScholarAI
        </button>
      )}
    </section>
  )
}
