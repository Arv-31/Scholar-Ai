import { useNavigate } from 'react-router-dom'
import type { Importance, MapSection } from '../content/types'

type Props = {
  examCode: string
  sections: MapSection[]
  subtopicIds: Record<string, string> // "Unit|Subtopic" -> id, for links to the notes
  completedUnits: Set<string> // unit names the student has completed
}

// Column positions of the tree (SVG units)
const ROOT = { x: 0, w: 110 }
const SECTION = { x: 150, w: 210 }
const UNIT = { x: 410, w: 220 }
const LEAF_X = 680
const ROW = 30
const GAP = 18 // space between two subjects
const WIDTH = 990

const IMPORTANCE_FILL: Record<Importance, string> = {
  3: 'var(--color-ember)',
  2: 'var(--color-green)',
  1: 'transparent',
}

// Splits a long label into at most two lines of about `max` characters.
function lines(text: string, max: number): string[] {
  if (text.length <= max) return [text]
  const words = text.split(' ')
  let first = ''
  while (words.length && (first + ' ' + words[0]).trim().length <= max) first += ' ' + words.shift()
  return [first.trim(), words.join(' ')]
}

// A smooth branch from (x1, y1) to (x2, y2)
const branch = (x1: number, y1: number, x2: number, y2: number) => {
  const mid = (x1 + x2) / 2
  return `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`
}

// Every leaf (a subtopic, or a unit without subtopics) gets its own row; each parent sits in
// the middle of its children.
function layout(sections: MapSection[]) {
  let y = 20
  const laid = sections.map((section, si) => {
    if (si > 0) y += GAP
    const units = section.units.map((unit) => {
      const leaves = (unit.subtopics.length ? unit.subtopics : [null]).map((sub) => {
        const leaf = { sub, y }
        y += ROW
        return leaf
      })
      const unitY = (leaves[0].y + leaves[leaves.length - 1].y) / 2
      return { unit, y: unitY, leaves }
    })
    const sectionY = (units[0].y + units[units.length - 1].y) / 2
    return { section, y: sectionY, units }
  })
  return { laid, height: y + 4, rootY: (laid[0].y + laid[laid.length - 1].y) / 2 }
}

// The syllabus as a tree: exam -> subjects -> units -> subtopics.
// Branch thickness = share of marks, dot colour = importance, ✓ = unit completed.
export default function SyllabusGraph({ examCode, sections, subtopicIds, completedUnits }: Props) {
  const navigate = useNavigate()
  const { laid, height, rootY } = layout(sections)

  const open = (unit: string, sub: string) => {
    const id = subtopicIds[`${unit}|${sub}`]
    if (id) navigate(`/exam/notes/${id}`)
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      className="w-full min-w-[760px]"
      role="img"
      aria-label={`${examCode} syllabus map`}
      fontFamily="var(--font-sans)"
    >
      {/* branches first, so the boxes sit on top */}
      <g fill="none" strokeLinecap="round">
        {laid.map(({ section, y: sy, units }) => (
          <g
            key={section.subject}
            stroke={section.inApp ? 'var(--color-green)' : 'var(--color-muted)'}
            strokeDasharray={section.inApp ? undefined : '5 5'}
          >
            <path
              d={branch(ROOT.x + ROOT.w, rootY, SECTION.x, sy)}
              strokeWidth={2 + section.weight / 5}
              strokeOpacity={0.55}
            />
            {units.map(({ unit, y: uy, leaves }) => (
              <g key={unit.name}>
                <path
                  d={branch(SECTION.x + SECTION.w, sy, UNIT.x, uy)}
                  strokeWidth={unit.importance * 1.6}
                  strokeOpacity={0.5}
                  strokeDasharray={unit.notInApp ? '5 5' : undefined}
                />
                {leaves.map(
                  ({ sub, y: ly }) =>
                    sub && (
                      <path
                        key={sub.name}
                        d={branch(UNIT.x + UNIT.w, uy, LEAF_X - 7, ly)}
                        strokeWidth={1.2}
                        strokeOpacity={0.45}
                      />
                    ),
                )}
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* root */}
      <g>
        <rect
          x={ROOT.x}
          y={rootY - 24}
          width={ROOT.w}
          height={48}
          rx={4}
          fill="var(--color-board)"
          stroke="var(--color-ink)"
        />
        <text
          x={ROOT.x + ROOT.w / 2}
          y={rootY + 5}
          textAnchor="middle"
          fontSize={15}
          fontWeight={700}
          fill="#edebe3"
        >
          {examCode}
        </text>
      </g>

      {laid.map(({ section, y: sy, units }) => {
        const label = lines(section.subject, 26)
        return (
          <g key={section.subject}>
            {/* subject box */}
            <rect
              x={SECTION.x}
              y={sy - 27}
              width={SECTION.w}
              height={54}
              rx={4}
              fill="var(--color-surface)"
              stroke="var(--color-ink)"
              strokeDasharray={section.inApp ? undefined : '4 3'}
            />
            {label.map((line, i) => (
              <text
                key={line}
                x={SECTION.x + 12}
                y={sy - 9 + i * 15 - (label.length - 1) * 6}
                fontSize={12.5}
                fontWeight={600}
                fill="var(--color-ink)"
              >
                {line}
              </text>
            ))}
            <text
              x={SECTION.x + 12}
              y={sy + 19}
              fontSize={11}
              fill="var(--color-muted)"
              fontFamily="var(--font-mono)"
            >
              {section.weight}% · {section.inApp ? section.questions : 'not in ScholarAI yet'}
            </text>

            {units.map(({ unit, y: uy, leaves }) => {
              const done = completedUnits.has(unit.name)
              const missing = unit.notInApp || !section.inApp
              return (
                <g key={unit.name}>
                  <rect
                    x={UNIT.x}
                    y={uy - 15}
                    width={UNIT.w}
                    height={30}
                    rx={4}
                    fill={done ? 'var(--color-green-soft)' : 'var(--color-surface)'}
                    stroke={done ? 'var(--color-green)' : 'var(--color-line)'}
                    strokeDasharray={missing ? '4 3' : undefined}
                  />
                  <text
                    x={UNIT.x + 10}
                    y={uy + 4}
                    fontSize={12}
                    fill={missing ? 'var(--color-muted)' : 'var(--color-ink)'}
                  >
                    {missing && <title>Part of the real syllabus, not in ScholarAI yet</title>}
                    {done ? '✓ ' : ''}
                    {unit.name.length > 27 ? unit.name.slice(0, 26) + '…' : unit.name}
                  </text>
                  <text
                    x={UNIT.x + UNIT.w - 10}
                    y={uy + 4}
                    fontSize={10}
                    textAnchor="end"
                    fill="var(--color-ember)"
                    aria-label={`importance ${unit.importance} of 3`}
                  >
                    {'●'.repeat(unit.importance)}
                  </text>

                  {leaves.map(({ sub, y: ly }) => {
                    if (!sub) return null
                    const linked = Boolean(subtopicIds[`${unit.name}|${sub.name}`])
                    return (
                      <g
                        key={sub.name}
                        role={linked ? 'link' : undefined}
                        tabIndex={linked ? 0 : undefined}
                        aria-label={linked ? `${sub.name} notes` : undefined}
                        className={linked ? 'cursor-pointer [&:hover_text]:underline' : undefined}
                        onClick={() => open(unit.name, sub.name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            open(unit.name, sub.name)
                          }
                        }}
                      >
                        <circle
                          cx={LEAF_X}
                          cy={ly}
                          r={5.5}
                          fill={IMPORTANCE_FILL[sub.importance]}
                          stroke="var(--color-ink)"
                          strokeWidth={1}
                        />
                        <text x={LEAF_X + 14} y={ly + 4} fontSize={12} fill="var(--color-ink)">
                          {sub.name}
                        </text>
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
