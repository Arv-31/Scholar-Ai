// Full-page "loading" state with a small pulsing dot.
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-muted">
      <span className="h-2 w-2 animate-ping rounded-full bg-green" />
      <span className="eyebrow">Loading</span>
    </div>
  )
}
