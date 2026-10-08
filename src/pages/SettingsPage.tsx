import { useState, type FormEvent } from 'react'
import PageHeader from '../components/PageHeader'
import { ErrorNote } from '../components/StateNote'
import { useAuth } from '../hooks/useAuth'
import { useLoad } from '../hooks/useLoad'
import { useShell } from '../hooks/useShell'
import { signOut } from '../services/authService'
import { listExams } from '../services/examService'
import { errorMessage } from '../services/functionsClient'
import { GeminiKeySchema, removeGeminiKey, saveGeminiKey } from '../services/keyService'
import { updateMyExam, updateMyName } from '../services/profileService'

// Account settings: name, exam, own Gemini key, sign out.
export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, refreshProfile } = useShell()

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader eyebrow="Settings" title="Your account" />

      {profile && (
        <>
          <ProfileCard initialName={profile.display_name ?? ''} examId={profile.exam_id} onSaved={refreshProfile} />
          <GeminiKeyCard hint={profile.gemini_key_hint} onChanged={refreshProfile} />
        </>
      )}

      <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="eyebrow">Signed in as</p>
          <p className="mt-1 font-medium">{user?.email}</p>
        </div>
        <button type="button" onClick={() => void signOut()} className="btn-ghost">
          Sign out
        </button>
      </section>
    </div>
  )
}

function ProfileCard({
  initialName,
  examId,
  onSaved,
}: {
  initialName: string
  examId: string | null
  onSaved: () => void
}) {
  const exams = useLoad(listExams)
  const [name, setName] = useState(initialName)
  const [exam, setExam] = useState(examId ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setError(null)
    try {
      await updateMyName(name)
      if (exam && exam !== examId) await updateMyExam(exam)
      setStatus('saved')
      onSaved()
    } catch (err) {
      setError(errorMessage(err))
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold">Profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Name</span>
          <input
            className="field"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setStatus('idle')
            }}
            maxLength={40}
            placeholder="What should we call you?"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Exam</span>
          <select
            className="field"
            value={exam}
            onChange={(e) => {
              setExam(e.target.value)
              setStatus('idle')
            }}
          >
            <option value="" disabled>
              Choose an exam
            </option>
            {exams.data?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.code}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <ErrorNote message={error} />}
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary py-2! text-sm" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {status === 'saved' && <span className="text-sm text-green">Saved</span>}
      </div>
    </form>
  )
}

function GeminiKeyCard({ hint, onChanged }: { hint: string | null; onChanged: () => void }) {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    const checked = GeminiKeySchema.safeParse(key)
    if (!checked.success) {
      setError(checked.error.issues[0].message)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await saveGeminiKey(checked.data)
      setKey('')
      onChanged()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    setBusy(true)
    setError(null)
    try {
      await removeGeminiKey()
      onChanged()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Gemini key</h2>
          <p className="mt-1 max-w-lg text-sm text-muted">
            Used for the AI tutor, Round 3 quizzes and daily book picks. It is stored on the server
            and never shown again. Get a free key from{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-ink underline decoration-green decoration-2 underline-offset-4"
            >
              Google AI Studio
            </a>
            .
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${hint ? 'bg-green-soft text-green' : 'bg-paper text-muted'}`}
        >
          {hint ? 'Connected' : 'Not set'}
        </span>
      </div>

      {hint && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3">
          <code className="nums text-sm">{hint}</code>
          <button type="button" className="btn-ghost" onClick={() => void handleRemove()} disabled={busy}>
            Remove
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="gemini-key" className="sr-only">
          Gemini API key
        </label>
        <input
          id="gemini-key"
          className="field"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={hint ? 'Paste a new key to replace it' : 'Paste your key (starts with AIza)'}
        />
        <button type="submit" className="btn-primary shrink-0 py-2! text-sm" disabled={busy || !key}>
          {busy ? 'Checking…' : hint ? 'Replace' : 'Save key'}
        </button>
      </form>
      {error && <ErrorNote message={error} />}
    </section>
  )
}
