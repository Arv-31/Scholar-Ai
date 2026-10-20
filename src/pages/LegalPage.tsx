import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

// Public Privacy Policy and Terms pages (no login needed). Google checks these links
// before it lets "Continue with Google" work for everyone.
const CONTACT = 'aravindkrishnamurthy.31@gmail.com'
const UPDATED = '20 October 2026'

type Section = { heading: string; points: string[] }

const PRIVACY: Section[] = [
  {
    heading: 'What we collect',
    points: [
      'Your email address and, if you sign in with Google, your name and profile picture.',
      'What you do in the app: quiz answers and scores, video watch %, Comfort Zone tasks, streak, book picks and exam choice.',
      'Your Gemini API key, only if you add one in Settings.',
    ],
  },
  {
    heading: 'How we use it',
    points: [
      'Only to run ScholarAI for you: show your progress, pick weak topics for quizzes, keep your streak and remember your settings.',
      'We do not show ads, and we never sell or share your data with anyone for marketing.',
    ],
  },
  {
    heading: 'Your Gemini key',
    points: [
      'Saved on your account so it follows your login. The app only ever shows it masked (AIza…xxxx).',
      'It is used only to send your own AI requests to Google Gemini, and is never logged.',
    ],
  },
  {
    heading: 'Other services we use',
    points: [
      'Supabase stores your account and progress.',
      'Google Gemini and Anthropic Claude answer AI questions. Only the question text is sent, not your email.',
      'YouTube plays study videos, and Open Library shows book covers. Their own privacy policies apply.',
      'Google Sign-In, if you choose it.',
    ],
  },
  {
    heading: 'Deleting your data',
    points: [
      `Email ${CONTACT} from your account email and we will delete your account and all its data.`,
    ],
  },
  {
    heading: 'About this project',
    points: [
      'ScholarAI is a BCA final-year student project at KLE S. Nijalingappa College, Bengaluru.',
    ],
  },
]

const TERMS: Section[] = [
  {
    heading: 'Using ScholarAI',
    points: [
      'ScholarAI is a free study helper for NIMCET, PGCET-MCA and MBA entrance exams, built as a student project.',
      'Use it for your own preparation. Do not misuse it, try to break it, or access other students’ data.',
    ],
  },
  {
    heading: 'Content and AI answers',
    points: [
      'Questions, notes and AI answers can contain mistakes. Always check with your official syllabus and books.',
      'We do not promise any exam result.',
    ],
  },
  {
    heading: 'Your account',
    points: [
      'Keep your password and Gemini key safe. You are responsible for activity on your account.',
      'We may remove accounts that misuse the app.',
    ],
  },
  {
    heading: 'Changes',
    points: ['The app and these terms may change. The date at the top shows the latest version.'],
  },
]

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const sections = kind === 'privacy' ? PRIVACY : TERMS
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service'

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/login"
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>

        <p className="eyebrow mt-10">ScholarAI</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated {UPDATED}</p>

        <div className="card mt-8 flex flex-col gap-7 p-7 sm:p-9">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-sm text-muted">
            Questions? Email{' '}
            <a className="underline underline-offset-4" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            to={kind === 'privacy' ? '/terms' : '/privacy'}
            className="underline underline-offset-4 hover:text-ink"
          >
            {kind === 'privacy' ? 'Terms of Service' : 'Privacy Policy'}
          </Link>
        </p>
      </div>
    </div>
  )
}
