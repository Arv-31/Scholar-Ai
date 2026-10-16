// Builds the migration that fills every subtopic up to 10 rounds × 5 questions.
//
//   node scripts/build-questions.mjs          check + write the migration
//   node scripts/build-questions.mjs --check  only check (no file written)
//
// Source: supabase/questions/<exam>/*.txt, one file per unit:
//
//   # NIMCET | Mathematics | Algebra
//   ## Sets & Logarithms
//   Question text ;; option A ;; *correct option ;; option C ;; option D
//
// "*" marks the one correct option. Each subtopic needs (50 − existing seeded questions) new ones;
// the existing ones come first (rounds 1, 2 …), new ones fill the remaining rounds in file order.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const MIGRATIONS = join(ROOT, 'supabase/migrations')
const SOURCE = join(ROOT, 'supabase/questions')
const OUT = join(MIGRATIONS, '20261017000100_seed_subtopic_rounds.sql')
const PER_SUBTOPIC = 50

// ---- what is already in the database (from the earlier seed migrations) ----
const subSql = readFileSync(join(MIGRATIONS, '20261016000100_seed_subtopics.sql'), 'utf8')
const existing = new Map() // "EXAM|Unit|Subtopic" -> number of seeded questions
for (const m of subSql.matchAll(
  /pg_temp\.sub\('([^']+)', '([^']+)', '([^']+)', '([^']+)', '\{([^}]*)\}', '\{([^}]*)\}'\)/g,
)) {
  const count = (m[5] ? m[5].split(',').length : 0) + (m[6] ? m[6].split(',').length : 0)
  existing.set(`${m[1]}|${m[3]}|${m[4]}`, count)
}

const seedSql = readFileSync(join(MIGRATIONS, '20261009000100_seed_content.sql'), 'utf8')
const seenText = new Map() // "EXAM|Unit" -> Set of question texts (to stop duplicates)
let unitKey = null
for (const line of seedSql.split('\n')) {
  const unit = line.match(/pg_temp\.unit\('([^']+)', '[^']+', '([^']+)'\)/)
  if (unit) unitKey = `${unit[1]}|${unit[2]}`
  const q = line.match(/pg_temp\.q\(\d, '((?:[^']|'')*)'/)
  if (q && unitKey) {
    if (!seenText.has(unitKey)) seenText.set(unitKey, new Set())
    seenText.get(unitKey).add(q[1].replace(/''/g, "'"))
  }
}

// ---- read the new questions ----
const problems = []
const added = new Map() // "EXAM|Unit|Subtopic" -> [{ question, options, correct }]
for (const exam of readdirSync(SOURCE)) {
  for (const file of readdirSync(join(SOURCE, exam)).filter((f) => f.endsWith('.txt'))) {
    const where = `${exam}/${file}`
    let header = null
    let sub = null
    readFileSync(join(SOURCE, exam, file), 'utf8')
      .split(/\r?\n/)
      .forEach((raw, i) => {
        const line = raw.trim()
        if (!line || line.startsWith('//')) return
        if (line.startsWith('## ')) {
          sub = line.slice(3).trim()
          if (!header) problems.push(`${where}:${i + 1} subtopic before the "# EXAM | Subject | Unit" line`)
          else if (!existing.has(`${header.exam}|${header.unit}|${sub}`))
            problems.push(`${where}:${i + 1} unknown subtopic "${sub}" in ${header.unit}`)
          return
        }
        if (line.startsWith('# ')) {
          const [examCode, subject, unit] = line.slice(2).split('|').map((s) => s.trim())
          header = { exam: examCode, subject, unit }
          return
        }
        const parts = line.split(' ;; ').map((s) => s.trim())
        if (parts.length !== 5) return problems.push(`${where}:${i + 1} needs a question and 4 options`)
        const options = parts.slice(1)
        const correct = options.findIndex((o) => o.startsWith('*'))
        if (correct < 0 || options.filter((o) => o.startsWith('*')).length !== 1)
          return problems.push(`${where}:${i + 1} mark exactly one option with *`)
        const clean = options.map((o) => o.replace(/^\*/, '').trim())
        if (new Set(clean).size !== 4) problems.push(`${where}:${i + 1} two options are the same`)
        if (!sub) return problems.push(`${where}:${i + 1} question before any "## Subtopic" line`)
        const textKey = `${header.exam}|${header.unit}`
        if (!seenText.has(textKey)) seenText.set(textKey, new Set())
        if (seenText.get(textKey).has(parts[0]))
          problems.push(`${where}:${i + 1} duplicate question in ${header.unit}: "${parts[0]}"`)
        seenText.get(textKey).add(parts[0])
        const key = `${header.exam}|${header.unit}|${sub}`
        if (!added.has(key)) added.set(key, [])
        added.get(key).push({ question: parts[0], options: clean, correct })
      })
  }
}

// ---- every subtopic must end at exactly 50 ----
let missing = 0
for (const [key, have] of existing) {
  const count = have + (added.get(key)?.length ?? 0)
  if (count !== PER_SUBTOPIC) {
    missing += Math.max(0, PER_SUBTOPIC - count)
    problems.push(`${key}: ${count} questions (needs ${PER_SUBTOPIC}: ${have} seeded + ${PER_SUBTOPIC - have} new)`)
  }
}

const total = [...added.values()].reduce((n, list) => n + list.length, 0)
console.log(`${total} new questions read, ${missing} still missing.`)
if (problems.length) {
  console.log(problems.slice(0, 60).join('\n'))
  if (problems.length > 60) console.log(`… and ${problems.length - 60} more`)
  process.exitCode = 1
}
if (process.argv.includes('--check') || problems.length) process.exit()

// ---- write the migration ----
const q = (s) => `'${s.replace(/'/g, "''")}'`
const out = [
  '-- ScholarAI: fills every subtopic up to 10 rounds × 5 questions (generated, do not edit by hand).',
  '-- Source: supabase/questions/*/*.txt  ·  Build: node scripts/build-questions.mjs',
  '-- Drafted by AI (Claude). Review against the official syllabus before the college review.',
  '-- New questions go after each subtopic’s existing ones: position p → round p/5 + 1.',
  '',
]
for (const [key, list] of added) {
  const [exam, unit, sub] = key.split('|')
  out.push(`-- ${exam} · ${unit} · ${sub}`)
  out.push(
    'insert into public.questions (unit_id, subtopic_id, round, sort_order, question, options, correct_index)',
  )
  out.push('select s.unit_id, s.id, (s.have + v.n - 1) / 5 + 1, (s.have + v.n - 1) % 5, v.q, v.o, v.c')
  out.push('from (')
  out.push('  select st.id, st.unit_id, (select count(*) from public.questions x where x.subtopic_id = st.id) as have')
  out.push('  from public.subtopics st')
  out.push('  join public.units u on u.id = st.unit_id')
  out.push('  join public.subjects sj on sj.id = u.subject_id')
  out.push('  join public.exams e on e.id = sj.exam_id')
  out.push(`  where e.code = ${q(exam)} and u.name = ${q(unit)} and st.name = ${q(sub)}`)
  out.push(') s, (values')
  out.push(
    list
      .map(
        (item, i) =>
          `  (${i + 1}, ${q(item.question)}, array[${item.options.map(q).join(', ')}], ${item.correct})`,
      )
      .join(',\n'),
  )
  out.push(') as v(n, q, o, c);')
  out.push('')
}
out.push('-- Stop everything if any subtopic does not end with exactly 10 full rounds.')
out.push('do $$')
out.push('begin')
out.push('  if exists (')
out.push('    select 1 from public.subtopics st')
out.push('    where (select count(*) from public.questions x where x.subtopic_id = st.id) <> 50')
out.push('  ) or exists (')
out.push('    select 1 from public.questions group by subtopic_id, round having count(*) <> 5')
out.push('  ) then')
out.push("    raise exception 'Some subtopics do not have exactly 10 rounds of 5 questions';")
out.push('  end if;')
out.push('end;')
out.push('$$;')
writeFileSync(OUT, out.join('\n') + '\n')
console.log(`Wrote ${OUT}`)
