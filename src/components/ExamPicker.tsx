import { useState } from 'react'
import { useLoad } from '../hooks/useLoad'
import { listExams } from '../services/examService'
import { errorMessage } from '../services/functionsClient'
import { updateMyExam } from '../services/profileService'
import { ErrorNote, Loading } from './StateNote'

type Props = {
  currentExamId: string | null
  onPicked: () => void
}

// Cards for choosing NIMCET / PGCET-MCA / MBA. Saves the choice on the student's profile.
export default function ExamPicker({ currentExamId, onPicked }: Props) {
  const exams = useLoad(listExams)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function pick(examId: string) {
    setSaving(examId)
    setError(null)
    try {
      await updateMyExam(examId)
      onPicked()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(null)
    }
  }

  if (exams.loading) return <Loading />
  if (exams.error) return <ErrorNote message={exams.error} onRetry={exams.reload} />

  return (
    <div className="space-y-3">
      {error && <ErrorNote message={error} />}
      <div className="grid gap-3 md:grid-cols-3">
        {exams.data?.map((exam, index) => {
          const current = exam.id === currentExamId
          return (
            <button
              key={exam.id}
              type="button"
              disabled={saving !== null}
              onClick={() => void pick(exam.id)}
              className={`card group flex cursor-pointer flex-col items-start gap-6 p-5 text-left transition hover:-translate-y-0.5 hover:border-green hover:shadow-[0_18px_40px_-24px_rgb(47_158_99/0.6)] ${
                current ? 'border-green' : ''
              }`}
            >
              <span className="nums eyebrow">0{index + 1}</span>
              <span>
                <span className="block font-display text-2xl font-semibold">{exam.code}</span>
                <span className="mt-1 block text-sm text-muted">{exam.name}</span>
              </span>
              <span className="text-sm font-medium text-green">
                {saving === exam.id ? 'Saving…' : current ? 'Current exam' : 'Choose →'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
