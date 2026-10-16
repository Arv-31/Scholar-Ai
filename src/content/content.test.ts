import { describe, expect, it } from 'vitest'
import mbaNotes from './notes/mba'
import nimcetNotes from './notes/nimcet'
import pgcetNotes from './notes/pgcet'
import mba from './syllabus/mba'
import nimcet from './syllabus/nimcet'
import pgcet from './syllabus/pgcet'

// The subtopics in the database come from this migration; the written content must match it.
const sql = Object.values(
  import.meta.glob('../../supabase/migrations/20261016000100_seed_subtopics.sql', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
)[0] as string
const seeded = [...sql.matchAll(/pg_temp\.sub\('([^']+)', '([^']+)', '([^']+)', '([^']+)'/g)]
  .map(([, exam, subject, unit, subtopic]) => ({ exam, subject, unit, subtopic }))
  .filter((row) => row.exam !== 'EXAM') // the usage example in the file's comment

const maps = { NIMCET: nimcet, 'PGCET-MCA': pgcet, MBA: mba }
const notes = { NIMCET: nimcetNotes, 'PGCET-MCA': pgcetNotes, MBA: mbaNotes }

describe('study content matches the database', () => {
  it('reads all 105 seeded subtopics', () => {
    expect(seeded).toHaveLength(105)
  })

  for (const [code, map] of Object.entries(maps)) {
    const rows = seeded.filter((r) => r.exam === code)

    it(`${code}: the map has every seeded subtopic, under the right subject and unit`, () => {
      for (const row of rows) {
        const section = map.sections.find((s) => s.subject === row.subject)
        const unit = section?.units.find((u) => u.name === row.unit)
        expect(
          unit?.subtopics.some((s) => s.name === row.subtopic),
          `${row.subject} > ${row.unit} > ${row.subtopic}`,
        ).toBe(true)
      }
    })

    it(`${code}: the map has no in-app subtopic that is missing from the database`, () => {
      const known = new Set(rows.map((r) => `${r.unit}|${r.subtopic}`))
      for (const section of map.sections)
        for (const unit of section.units)
          for (const sub of unit.subtopics)
            expect(known.has(`${unit.name}|${sub.name}`), `${unit.name}|${sub.name}`).toBe(true)
    })

    it(`${code}: weights add up to 100%`, () => {
      expect(map.sections.reduce((sum, s) => sum + s.weight, 0)).toBe(100)
    })

    it(`${code}: every subtopic has complete notes`, () => {
      const examNotes = notes[code as keyof typeof notes]
      for (const row of rows) {
        const n = examNotes[`${row.unit}|${row.subtopic}`]
        const label = `${row.unit}|${row.subtopic}`
        expect(n, label).toBeDefined()
        expect(
          n.paragraphs.every((p) => p.length > 200),
          label,
        ).toBe(true)
        expect(n.keyPoints.length, label).toBeGreaterThanOrEqual(4)
        expect(n.formulas.length, label).toBeGreaterThanOrEqual(3)
      }
      expect(Object.keys(examNotes).length).toBe(rows.length) // no stray, misspelt keys
    })
  }
})
