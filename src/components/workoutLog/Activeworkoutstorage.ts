export interface PlannedExercise {
  id: string
  exercise: {
    id: string
    name: string
    muscleGroup?: string
    imageUrl?: string | null
  }
  sets: number
  reps: string
  restSeconds: number
}

export interface ActiveWorkoutState {
  programId: string
  programName: string
  style: string
  day: { title: string; exercises: PlannedExercise[] }
  dayIndex: number
  totalDaysPerWeek: number
  startedAt: number
  values: Record<string, { reps: string; weight: string }>
}

const ACTIVE_WORKOUT_KEY = "trainova_active_workout"

export const saveActiveWorkout = (state: ActiveWorkoutState) => {
  localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(state))
}

export const loadActiveWorkout = (): ActiveWorkoutState | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed.startedAt === "number" &&
      parsed.day?.exercises?.length
    ) {
      return parsed
    }
  } catch {}
  return null
}

export const clearActiveWorkout = () => {
  localStorage.removeItem(ACTIVE_WORKOUT_KEY)
}
