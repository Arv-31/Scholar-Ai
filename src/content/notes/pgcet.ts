import type { ExamNotes } from '../types'
import computer from './pgcet/computer'
import english from './pgcet/english'
import quant from './pgcet/quant'
import reasoning from './pgcet/reasoning'

// All PGCET-MCA notes, keyed by "Unit|Subtopic".
const pgcet: ExamNotes = { ...english, ...quant, ...reasoning, ...computer }

export default pgcet
