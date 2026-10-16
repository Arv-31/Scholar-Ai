import type { ExamNotes } from '../types'
import computer from './nimcet/computer'
import english from './nimcet/english'
import maths from './nimcet/maths'
import reasoning from './nimcet/reasoning'

// All NIMCET notes, keyed by "Unit|Subtopic".
const nimcet: ExamNotes = { ...maths, ...reasoning, ...computer, ...english }

export default nimcet
