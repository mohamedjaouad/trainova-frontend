import { useEffect, useState } from "react"
import { Alert, Button, Card, Container, Form, Row, Col } from "react-bootstrap"
import { useLocation, useNavigate } from "react-router-dom"
import apiClient from "../../api/api"
import {
  saveActiveWorkout,
  loadActiveWorkout,
  clearActiveWorkout,
  type PlannedExercise,
} from "./activestorage"
import "./WorkoutLog.css"

interface WorkoutState {
  programId: string
  programName: string
  style: string
  day: { title: string; exercises: PlannedExercise[] }
  dayIndex: number
  totalDaysPerWeek: number
}

const progressKey = (programId: string) => `trainova_progress_${programId}`

const MUSCLE_GROUP_VISUALS: Record<string, { icon: string; color: string }> = {
  Petto: { icon: "bi-lungs", color: "#c41e3a" },
  Schiena: { icon: "bi-person-standing", color: "#3a7bd5" },
  Gambe: { icon: "bi-bicycle", color: "#2ecc71" },
  Spalle: { icon: "bi-triangle", color: "#f39c12" },
  Braccia: { icon: "bi-lightning-charge", color: "#9b59b6" },
  Core: { icon: "bi-circle-square", color: "#e67e22" },
}

const DEFAULT_VISUAL = { icon: "bi-activity", color: "#c41e3a" }

function ExerciseThumb({
  exercise,
}: {
  exercise: PlannedExercise["exercise"]
}) {
  const [isHovered, setIsHovered] = useState(false)

  if (!exercise.imageUrl) {
    const visual =
      (exercise.muscleGroup && MUSCLE_GROUP_VISUALS[exercise.muscleGroup]) ||
      DEFAULT_VISUAL

    return (
      <div
        className="active-workout-exercise-image active-workout-exercise-fallback"
        style={{
          backgroundColor: `${visual.color}1a`,
          borderColor: `${visual.color}4d`,
          color: visual.color,
        }}
      >
        <i className={`bi ${visual.icon}`}></i>
      </div>
    )
  }

  const isGif = exercise.imageUrl?.toLowerCase().endsWith(".gif")

  return (
    <div
      className="active-workout-exercise-image-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={exercise.imageUrl}
        alt={exercise.name}
        className="active-workout-exercise-image"
        style={{
          ...(isGif && !isHovered
            ? {
                animationPlayState: "paused",
              }
            : {}),
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    </div>
  )
}

export default function ActiveWorkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const incomingWorkout = location.state as WorkoutState | null
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState<
    Record<string, { reps: string; weight: string }>
  >({})
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const [workout] = useState<(WorkoutState & { startedAt: number }) | null>(
    () => {
      if (incomingWorkout) {
        const withStart = { ...incomingWorkout, startedAt: Date.now() }
        saveActiveWorkout({ ...withStart, values: {} })
        return withStart
      }
      const saved = loadActiveWorkout()
      if (saved) {
        setTimeout(() => setValues(saved.values), 0)
        return saved
      }
      return null
    },
  )

  const startedAt = workout?.startedAt ?? Date.now()

  useEffect(() => {
    const timer = window.setInterval(
      () => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [startedAt])

  const formattedDuration = `${String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`

  if (!workout?.day?.exercises?.length) {
    return (
      <Container className="pt-5">
        <Alert variant="warning">
          Apri prima un programma e scegli "Start Workout".
        </Alert>
        <Button onClick={() => navigate("/program-detail")}>
          Vai al programma
        </Button>
      </Container>
    )
  }

  const updateValue = (id: string, field: "reps" | "weight", value: string) => {
    setValues((current) => {
      const next = {
        ...current,
        [id]: {
          reps: current[id]?.reps ?? "",
          weight: current[id]?.weight ?? "",
          [field]: value,
        },
      }
      saveActiveWorkout({ ...workout, values: next })
      return next
    })
  }

  const finishWorkout = async () => {
    setSaving(true)
    setError(null)
    try {
      await apiClient.post("/workouts", {
        title: `${workout.programName} — ${workout.day.title}`,
        type: workout.style,
        intensity: "Completato",
        duration: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
        exercises: workout.day.exercises.map((exercise) => ({
          exerciseId: exercise.exercise.id,
          sets: exercise.sets,
          reps: values[exercise.id]?.reps || exercise.reps,
          weightKg: values[exercise.id]?.weight
            ? Number(values[exercise.id].weight)
            : null,
          rest: `${exercise.restSeconds}s`,
        })),
      })

      const key = progressKey(workout.programId)
      let stored: { week: number; completedDays: number[] }
      try {
        const raw = localStorage.getItem(key)
        stored = raw ? JSON.parse(raw) : { week: 1, completedDays: [] }
        if (
          typeof stored.week !== "number" ||
          !Array.isArray(stored.completedDays)
        ) {
          stored = { week: 1, completedDays: [] }
        }
      } catch {
        stored = { week: 1, completedDays: [] }
      }

      const dayIdx = workout.dayIndex ?? 0
      if (!stored.completedDays.includes(dayIdx)) {
        stored.completedDays.push(dayIdx)
      }

      if (stored.completedDays.length >= workout.totalDaysPerWeek) {
        stored.week += 1
        stored.completedDays = []
      }

      localStorage.setItem(key, JSON.stringify(stored))
      clearActiveWorkout()

      navigate("/program-detail")
    } catch (requestError) {
      console.error("Errore nel salvataggio del workout", requestError)
      setError("Non è stato possibile salvare l'allenamento. Riprova.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="workoutlog-page active-workout-page">
      <Container fluid className="px-3 px-md-4">
        <div className="active-workout-header">
          <div>
            <span className="active-workout-eyebrow">
              <i className="bi bi-record-circle"></i> Allenamento in corso
            </span>
            <h1 className="workoutlog-title">{workout.day.title}</h1>
            <p className="workoutlog-subtitle">
              {workout.programName} · Inserisci i risultati reali di ogni
              esercizio.
            </p>
          </div>
          <div className="active-workout-stats">
            <div className="active-workout-timer">
              <i className="bi bi-stopwatch"></i>
              <strong>{formattedDuration}</strong>
              <span>durata</span>
            </div>
            <div className="active-workout-count">
              <strong>{workout.day.exercises.length}</strong>
              <span>esercizi</span>
            </div>
          </div>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {workout.day.exercises.map((exercise, index) => (
          <Card
            key={exercise.id}
            className="workoutlog-card active-workout-card mb-3"
          >
            <Card.Body>
              <Row className="d-flex align-items-center g-3">
                <Col xs={12} md={5} lg={2}>
                  <ExerciseThumb exercise={exercise.exercise} />
                </Col>

                <Col xs={12} md={7} lg={10}>
                  <div className="active-workout-exercise-heading">
                    <span className="active-workout-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h5>{exercise.exercise.name}</h5>
                      <p>
                        Target:{" "}
                        <strong>
                          {exercise.sets} × {exercise.reps}
                        </strong>
                        <span>Recupero {exercise.restSeconds}s</span>
                      </p>
                    </div>
                  </div>
                  <div className="active-workout-fields">
                    <Form.Group className="active-workout-field">
                      <Form.Label>Ripetizioni effettive</Form.Label>
                      <Form.Control
                        value={values[exercise.id]?.reps ?? ""}
                        placeholder={`Es. ${exercise.reps}`}
                        onChange={(event) =>
                          updateValue(exercise.id, "reps", event.target.value)
                        }
                      />
                    </Form.Group>
                    <Form.Group className="active-workout-field">
                      <Form.Label>Carico (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.5"
                        value={values[exercise.id]?.weight ?? ""}
                        onChange={(event) =>
                          updateValue(exercise.id, "weight", event.target.value)
                        }
                      />
                    </Form.Group>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
        <div className="active-workout-save">
          <Button disabled={saving} onClick={finishWorkout}>
            <i className="bi bi-check2-circle"></i>
            {saving ? "Salvataggio..." : "Termina e salva allenamento"}
          </Button>
        </div>
      </Container>
    </div>
  )
}
