import type { ExamNotes } from '../types'
import gk from './mba/gk'
import logical from './mba/logical'
import quant from './mba/quant'
import verbal from './mba/verbal'

// All MBA notes, keyed by "Unit|Subtopic".
const mba: ExamNotes = { ...quant, ...verbal, ...logical, ...gk }

export default mba
