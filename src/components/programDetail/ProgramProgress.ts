export interface ProgramProgress {
  week: number
  completedDays: number[]
}

export const progressKey = (programId: string) =>
  `trainova_progress_${programId}`

export const loadProgress = (programId: string): ProgramProgress => {
  try {
    const raw = localStorage.getItem(progressKey(programId))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (
        typeof parsed.week === "number" &&
        Array.isArray(parsed.completedDays)
      ) {
        return parsed
      }
    }
  } catch {}
  return { week: 1, completedDays: [] }
}

export const getNextDayIndex = (
  progress: ProgramProgress,
  totalDaysPerWeek: number,
): number => {
  for (let i = 0; i < totalDaysPerWeek; i++) {
    if (!progress.completedDays.includes(i)) return i
  }
  return 0
}

export const isProgramComplete = (
  progress: ProgramProgress,
  weeksDuration: number,
) => progress.week > weeksDuration

export const markDayCompleted = (
  programId: string,
  dayIndex: number,
  totalDaysPerWeek: number,
): ProgramProgress => {
  const stored = loadProgress(programId)

  if (!stored.completedDays.includes(dayIndex)) {
    stored.completedDays.push(dayIndex)
  }

  if (stored.completedDays.length >= totalDaysPerWeek) {
    stored.week += 1
    stored.completedDays = []
  }

  localStorage.setItem(progressKey(programId), JSON.stringify(stored))
  return stored
}
