import { supabase } from '../lib/supabaseClient'
import {
  buildMastery,
  type AttemptRow,
  type MasteryData,
  type QuestionRow,
  type SubtopicRow,
  type UnitMastery,
  type VideoRow,
} from '../lib/mastery'
import { getMyWatch } from './videoService'

// Everything the paper (mastery) needs, for some units or for all of them.
// Safe before the subtopics migration: missing tables/columns just mean "no subtopics".
export async function getMasteryData(unitIds?: string[]): Promise<MasteryData> {
  // the same "only these units" filter for every table
  const rows = (table: string, columns: string) => {
    const query = supabase.from(table).select(columns)
    return unitIds ? query.in('unit_id', unitIds) : query
  }

  const [subtopics, questions, attempts, videos, watch] = await Promise.all([
    rows('subtopics', 'id, unit_id, name, sort_order'),
    rows('questions', 'unit_id, question, subtopic_id'),
    rows('quiz_attempts', 'unit_id, percent, answers').limit(1000),
    rows('unit_videos', 'id, unit_id, title, subtopic_id'),
    getMyWatch(),
  ])
  if (attempts.error) throw new Error('Could not load your progress.')

  // Before the migration the subtopic_id column does not exist yet: load videos without it.
  const plainVideos = videos.error ? await rows('unit_videos', 'id, unit_id, title') : null

  const videoRows = plainVideos
    ? ((plainVideos.data ?? []) as unknown as Omit<VideoRow, 'subtopic_id'>[]).map((v) => ({
        ...v,
        subtopic_id: null,
      }))
    : ((videos.data ?? []) as unknown as VideoRow[])

  return {
    subtopics: (subtopics.error ? [] : subtopics.data) as unknown as SubtopicRow[],
    questions: (questions.error ? [] : questions.data) as unknown as QuestionRow[],
    attempts: ((attempts.data ?? []) as unknown as AttemptRow[]).map((a) => ({
      ...a,
      percent: Number(a.percent),
    })),
    videos: videoRows,
    watch,
  }
}

// Mastery of every unit (and its subtopics), keyed by unit id.
export async function getMastery(unitIds?: string[]): Promise<Record<string, UnitMastery>> {
  return buildMastery(await getMasteryData(unitIds))
}
