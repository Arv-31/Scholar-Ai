// The ONE Edge Function for every AI feature: chatbot, round-3 quiz and daily books.
// Flow: check login -> check input (Zod) -> callAi() (routing -> retrieve -> provider) -> check output (Zod)
import { z } from 'npm:zod@4'
import { admin, getUser } from '../_shared/auth.ts'
import { callAi, NoKeyError, parseJson } from '../_shared/callAi.ts'
import { corsHeaders, fail, json } from '../_shared/cors.ts'
import { ProviderError } from '../_shared/providers/types.ts'

const ChatInput = z.object({
  task: z.literal('chat'),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(30),
  context: z.string().max(200).optional(), // e.g. "NIMCET · Mathematics · Calculus"
})

const QuizInput = z.object({ task: z.literal('quiz'), unitId: z.uuid() })

const BooksInput = z.object({ task: z.literal('books'), day: z.iso.date() })

const Input = z.discriminatedUnion('task', [ChatInput, QuizInput, BooksInput])

const QuizOutput = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().optional(),
      }),
    )
    .length(5),
})

const Book = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  reason: z.string().min(1),
})
const BooksOutput = z.object({ fiction: Book, nonFiction: Book })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const user = await getUser(req)
  if (!user) return fail('UNAUTHORIZED', 'Please sign in again.', 401)

  const parsed = Input.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('BAD_INPUT', 'The request was not valid.')
  const input = parsed.data

  try {
    if (input.task === 'chat') return json(await chat(user.id, input))
    if (input.task === 'quiz') return json(await quiz(user.id, input.unitId))
    return json(await books(user.id, input.day))
  } catch (error) {
    if (error instanceof NoKeyError) {
      return fail('NO_KEY', 'Add your Gemini key in Settings to use this.')
    }
    if (error instanceof ProviderError && (error.status === 400 || error.status === 403)) {
      return fail('BAD_KEY', 'Your Gemini key was rejected. Check it in Settings.')
    }
    if (error instanceof ProviderError && error.status === 429) {
      return fail('RATE_LIMIT', 'The AI is busy or your key hit its limit. Try again in a minute.', 429)
    }
    console.error('ai function failed:', error instanceof Error ? error.message : 'unknown')
    return fail('AI_FAILED', 'The AI could not answer right now. Please try again.', 502)
  }
})

// ---------- Chatbot ----------
async function chat(userId: string, input: z.infer<typeof ChatInput>) {
  const system = [
    'You are ScholarAI, a friendly tutor for Indian MCA/MBA entrance exams (NIMCET, Karnataka PGCET-MCA, MBA entrances).',
    'Explain step by step in simple English. Keep answers short and clear; use small examples.',
    'For maths, show the working. If a question is not about studies, gently steer back to exam prep.',
    'Write plain text: no markdown symbols such as ** or #. Use simple numbered lines for steps.',
    input.context ? `The student is currently studying: ${input.context}.` : '',
  ].join(' ')

  const reply = await callAi({ task: 'chat', userId, system, messages: input.messages })
  return { reply }
}

// ---------- Round 3: live quiz on weak topics ----------
async function quiz(userId: string, unitId: string) {
  const { data: unit } = await admin
    .from('units')
    .select('name, subjects(name, exams(code))')
    .eq('id', unitId)
    .maybeSingle()
  if (!unit) throw new Error('Unit not found')

  // Questions the student got wrong in rounds 1 and 2 = their weak spots.
  const { data: attempts } = await admin
    .from('quiz_attempts')
    .select('answers')
    .eq('user_id', userId)
    .eq('unit_id', unitId)
    .in('round', [1, 2])
    .order('created_at', { ascending: false })
    .limit(6)

  const wrong = new Set<string>()
  for (const attempt of attempts ?? []) {
    for (const answer of (attempt.answers ?? []) as { question: string; chosen: number; correct: number }[]) {
      if (answer.chosen !== answer.correct) wrong.add(answer.question)
    }
  }
  const weak = [...wrong].slice(0, 6)

  // deno-lint-ignore no-explicit-any
  const subject = (unit as any).subjects
  const where = `${subject?.exams?.code ?? ''} · ${subject?.name ?? ''} · ${unit.name}`

  const system =
    'You write multiple-choice questions for Indian entrance exams. Reply with JSON only, in this shape: ' +
    '{"questions":[{"question":"...","options":["a","b","c","d"],"correctIndex":0,"explanation":"one line"}]}. ' +
    'Exactly 5 questions, exactly 4 options each, one correct answer, exam-level difficulty, no trick wording.'

  const prompt = weak.length
    ? `Topic: ${where}. The student got these wrong earlier, so focus on the same ideas (do not repeat them word for word):\n${weak.map((q) => `- ${q}`).join('\n')}`
    : `Topic: ${where}. Cover the most important ideas of this unit.`

  const text = await callAi({
    task: 'quiz',
    userId,
    system,
    messages: [{ role: 'user', content: prompt }],
    json: true,
  })
  return QuizOutput.parse(parseJson(text))
}

// ---------- Daily books (once per day, cached in daily_books) ----------
async function books(userId: string, day: string) {
  const { data: cached } = await admin
    .from('daily_books')
    .select('kind, title, author, reason')
    .eq('user_id', userId)
    .eq('day', day)
  if (cached && cached.length >= 2) return { books: cached }

  // Avoid suggesting the same books again.
  const { data: recent } = await admin
    .from('daily_books')
    .select('title')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  const avoid = (recent ?? []).map((b) => b.title).join('; ')

  const system =
    'You recommend books to a college student preparing for entrance exams. Reply with JSON only: ' +
    '{"fiction":{"title":"","author":"","reason":""},"nonFiction":{"title":"","author":"","reason":""}}. ' +
    'Real, well-known books only. The reason is one plain sentence on why it is worth reading now. No hype.'

  const text = await callAi({
    task: 'books',
    userId,
    system,
    messages: [
      { role: 'user', content: `Pick today's two books.${avoid ? ` Do not pick: ${avoid}.` : ''}` },
    ],
    json: true,
  })
  const picks = BooksOutput.parse(parseJson(text))

  const rows = [
    { user_id: userId, day, kind: 'fiction', ...picks.fiction },
    { user_id: userId, day, kind: 'non_fiction', ...picks.nonFiction },
  ]
  await admin.from('daily_books').upsert(rows, { onConflict: 'user_id,day,kind', ignoreDuplicates: true })

  const { data: saved } = await admin
    .from('daily_books')
    .select('kind, title, author, reason')
    .eq('user_id', userId)
    .eq('day', day)
  return { books: saved ?? [] }
}
