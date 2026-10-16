// "Mastery" drives the paper ball. It is a separate picture from unit completion:
// completion still follows PASS_PERCENT in quiz.ts (60% in any round), unchanged.
//
// mastery = 50% average video watch + 50% best quiz score, always using best values,
// so it never goes backwards. If a unit has no videos yet, the quiz counts for all of it.

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

function clamp(n: number) {
  return Math.max(0, Math.min(100, n))
}
