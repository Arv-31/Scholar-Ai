import type { AiTask } from './aiRouting.ts'

// RAG hook. Today it returns nothing, so the model answers on its own.
// Later this can search our notes/syllabus and return the most relevant passages;
// callAi() already adds whatever this returns to the prompt.
export function retrieve(_task: AiTask, _query: string): Promise<string[]> {
  return Promise.resolve([])
}
