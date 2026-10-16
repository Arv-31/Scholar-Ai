import { beforeEach, describe, expect, it, vi } from 'vitest'

// A fake Supabase client: each table returns the rows set in `tables`, whatever the query.
const tables: Record<string, { data: unknown; error: unknown }> = {}
vi.mock('../lib/supabaseClient', () => {
  const query = (table: string) => {
    const result = () => tables[table] ?? { data: [], error: null }
    const chain = {
      select: () => chain,
      order: () => chain,
      limit: () => chain,
      then: (done: (v: unknown) => unknown) => Promise.resolve(result()).then(done),
    }
    return chain
  }
  return { supabase: { from: query } }
})

const { getMistakes } = await import('./mistakeService')

const options = ['a', 'b', 'c', 'd']
const answer = (question: string, chosen: number, correct = 0) => ({
  question,
  options,
  chosen,
  correct,
  subtopic_id: null,
})

describe('mistake notebook (with a fake database)', () => {
  beforeEach(() => {
    for (const key of Object.keys(tables)) delete tables[key]
  })

  it('lists each wrong question once, grouped by unit, biggest group first', async () => {
    tables.quiz_attempts = {
      error: null,
      data: [
        // newest first, like the real query
        {
          unit_id: 'u2',
          created_at: '2026-10-16',
          units: { name: 'Calculus' },
          answers: [answer('Q4', 1), answer('Q5', 2)],
        },
        {
          unit_id: 'u1',
          created_at: '2026-10-15',
          units: { name: 'Algebra' },
          answers: [answer('Q1', 1), answer('Q2', 0)],
        },
        {
          unit_id: 'u1',
          created_at: '2026-10-14',
          units: { name: 'Algebra' },
          answers: [answer('Q1', 3)],
        },
      ],
    }
    const groups = await getMistakes()
    expect(groups.map((g) => [g.unitName, g.mistakes.map((m) => m.question)])).toEqual([
      ['Calculus', ['Q4', 'Q5']],
      ['Algebra', ['Q1']], // Q2 was right; Q1 wrong twice but listed once
    ])
  })

  it('hides a question cleared in revision, but brings it back after a newer wrong quiz answer', async () => {
    tables.quiz_attempts = {
      error: null,
      data: [
        {
          unit_id: 'u1',
          created_at: '2026-10-15T10:00:00Z',
          units: { name: 'Algebra' },
          answers: [answer('Q1', 1), answer('Q2', 1)],
        },
      ],
    }
    tables.mistake_reviews = {
      error: null,
      data: [
        // Q1 cleared after the quiz: gone. Q2 cleared before the quiz: back in the notebook.
        {
          unit_id: 'u1',
          question: 'Q1',
          right_streak: 2,
          cleared: true,
          updated_at: '2026-10-15T12:00:00Z',
        },
        {
          unit_id: 'u1',
          question: 'Q2',
          right_streak: 2,
          cleared: true,
          updated_at: '2026-10-14T12:00:00Z',
        },
      ],
    }
    const [algebra] = await getMistakes()
    expect(algebra.mistakes.map((m) => [m.question, m.rightStreak])).toEqual([['Q2', 0]])
  })

  it('still works before the study-tools update (no review table yet)', async () => {
    tables.quiz_attempts = {
      error: null,
      data: [{ unit_id: 'u1', created_at: '2026-10-15', units: null, answers: [answer('Q1', 2)] }],
    }
    tables.mistake_reviews = { data: null, error: { message: 'relation does not exist' } }
    const groups = await getMistakes()
    expect(groups[0]).toMatchObject({ unitName: 'Unit', mistakes: [{ question: 'Q1' }] })
  })

  it('reports a clear error when quiz attempts cannot be loaded', async () => {
    tables.quiz_attempts = { data: null, error: { message: 'offline' } }
    await expect(getMistakes()).rejects.toThrow('Could not load your mistakes.')
  })
})
