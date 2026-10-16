// "Mastery" drives the paper ball. It is a separate picture from unit completion:
// completion still follows PASS_PERCENT in quiz.ts (60% in any round), unchanged.
//
// mastery = 50% average video watch + 50% best quiz score, always using best values,
// so it never goes backwards. If there are no videos yet, the quiz counts for all of it.
// A unit with subtopics: each subtopic gets its own mastery, and the unit is their average.

// A paper that has fully unfolded becomes an achievement on the Progress page.
export const ACHIEVED_PERCENT = 100

export type MasteryInput = {
  videoWatch: number[] // watch % (0-100) for each video of the unit; 0 if not started
  bestQuizPercent: number | null // best % over all rounds, null if no attempts
}

export function masteryPercent({ videoWatch, bestQuizPercent }: MasteryInput): number {
  const quiz = clamp(bestQuizPercent ?? 0)
  if (videoWatch.length === 0) return Math.round(quiz)
  const watched = videoWatch.reduce((sum, p) => sum + clamp(p), 0) / videoWatch.length
  return Math.round(watched * 0.5 + quiz * 0.5)
}

// ---------- whole units and their subtopics ----------

export type SubtopicRow = { id: string; unit_id: string; name: string; sort_order: number }
export type QuestionRow = { unit_id: string; question: string; subtopic_id: string | null }
export type AttemptRow = {
  unit_id: string
  percent: number
  answers:
    { question: string; chosen: number; correct: number; subtopic_id?: string | null }[] | null
}
export type VideoRow = { id: string; unit_id: string; title: string; subtopic_id: string | null }

export type SubtopicMastery = {
  id: string
  name: string
  mastery: number
  videoAvg: number | null // average watch %, null if the subtopic has no videos
  bestQuiz: number | null // best % on this subtopic's questions, null if never answered
}

export type UnitMastery = {
  mastery: number
  videoAvg: number | null
  bestQuiz: number | null
  subtopics: SubtopicMastery[] // empty when the unit has no subtopics yet
}

export type MasteryData = {
  subtopics: SubtopicRow[]
  questions: QuestionRow[]
  attempts: AttemptRow[]
  videos: VideoRow[]
  watch: Record<string, number> // video id -> watch %
}

// Works out the mastery of every unit (and of each subtopic) from what we already save.
export function buildMastery(data: MasteryData): Record<string, UnitMastery> {
  const subtopicsOf = groupByUnit([...data.subtopics].sort((a, b) => a.sort_order - b.sort_order))
  const videosOf = groupByUnit(data.videos)
  const attemptsOf = groupByUnit(data.attempts)
  // older saved answers have no subtopic, so we look the question text up instead
  const subtopicOfQuestion = new Map<string, string | null>()
  for (const q of data.questions)
    subtopicOfQuestion.set(`${q.unit_id}|${q.question}`, q.subtopic_id)

  const unitIds = new Set([
    ...Object.keys(subtopicsOf),
    ...Object.keys(videosOf),
    ...Object.keys(attemptsOf),
  ])
  const result: Record<string, UnitMastery> = {}

  for (const unitId of unitIds) {
    const subs = subtopicsOf[unitId] ?? []
    const videos = videosOf[unitId] ?? []
    const attempts = attemptsOf[unitId] ?? []
    const watchOf = (v: VideoRow) => data.watch[v.id] ?? 0
    const allWatch = videos.map(watchOf)
    const bestQuiz = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null

    if (subs.length === 0) {
      result[unitId] = {
        mastery: masteryPercent({ videoWatch: allWatch, bestQuizPercent: bestQuiz }),
        videoAvg: average(allWatch),
        bestQuiz,
        subtopics: [],
      }
      continue
    }

    const videoSub = assignVideos(videos, subs)
    const subtopics = subs.map((sub): SubtopicMastery => {
      const watch = videos.filter((v) => videoSub.get(v.id) === sub.id).map(watchOf)
      let best: number | null = null
      for (const attempt of attempts) {
        const mine = (attempt.answers ?? []).filter(
          (a) => (a.subtopic_id ?? subtopicOfQuestion.get(`${unitId}|${a.question}`)) === sub.id,
        )
        if (mine.length === 0) continue
        const percent = (mine.filter((a) => a.chosen === a.correct).length / mine.length) * 100
        best = Math.max(best ?? 0, percent)
      }
      return {
        id: sub.id,
        name: sub.name,
        mastery: masteryPercent({ videoWatch: watch, bestQuizPercent: best }),
        videoAvg: average(watch),
        bestQuiz: best === null ? null : Math.round(best),
      }
    })

    result[unitId] = {
      mastery: Math.round(subtopics.reduce((sum, s) => sum + s.mastery, 0) / subtopics.length),
      videoAvg: average(allWatch),
      bestQuiz,
      subtopics,
    }
  }
  return result
}

// Which subtopic each video belongs to: its saved subtopic, else the subtopic whose name shares
// the most words with the title, else spread evenly in order.
export function assignVideos(videos: VideoRow[], subtopics: SubtopicRow[]): Map<string, string> {
  const map = new Map<string, string>()
  if (subtopics.length === 0) return map
  const subWords = subtopics.map((s) => words(s.name))
  videos.forEach((video, index) => {
    if (video.subtopic_id && subtopics.some((s) => s.id === video.subtopic_id)) {
      map.set(video.id, video.subtopic_id)
      return
    }
    const title = words(video.title)
    let bestIndex = -1
    let bestScore = 0
    subWords.forEach((set, i) => {
      const score = [...set].filter((w) => title.has(w)).length
      if (score > bestScore) {
        bestScore = score
        bestIndex = i
      }
    })
    map.set(video.id, subtopics[bestIndex >= 0 ? bestIndex : index % subtopics.length].id)
  })
  return map
}

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3),
  )
}

function groupByUnit<T extends { unit_id: string }>(rows: T[]): Record<string, T[]> {
  const map: Record<string, T[]> = {}
  for (const row of rows) {
    const list = map[row.unit_id] ?? []
    list.push(row)
    map[row.unit_id] = list
  }
  return map
}

function average(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + clamp(b), 0) / values.length : null
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n))
}
