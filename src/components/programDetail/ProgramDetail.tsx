import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
} from "react-bootstrap"
import apiClient from "../../api/api"
import {
  loadProgress,
  getNextDayIndex,
  isProgramComplete as checkProgramComplete,
  type ProgramProgress,
} from "./ProgramProgress"
import "./ProgramDetail.css"

interface ProgramData {
  id: string
  name: string
  goal: string
  style: string
  daysPerWeek: number
  weeksDuration: number
  createdAt: string
  days: {
    id: string
    title: string
    dayIndex: number
    exercises: {
      id: string
      exercise: {
        name: string
        muscleGroup: string
      }
      sets: number
      reps: string
      restSeconds: number
      notes: string | null
    }[]
  }[]
}

const getGoalLabel = (goal: string): string => {
  const map: Record<string, string> = {
    muscle: "Aumentare massa",
    fatloss: "Perdere grasso",
    strength: "Aumentare la forza",
    endurance: "Migliorare resistenza",
  }
  return map[goal] || goal || "N/A"
}

const getGoalIcon = (goal: string): string => {
  const map: Record<string, string> = {
    muscle: "bi-arrows-expand",
    fatloss: "bi-fire",
    strength: "bi-lightning-charge",
    endurance: "bi-heart-pulse",
  }
  return map[goal] || "bi-bullseye"
}

export default function ProgramDetail() {
  const navigate = useNavigate()
  const [program, setProgram] = useState<ProgramData | null>(null)
  const [progress, setProgress] = useState<ProgramProgress>({
    week: 1,
    completedDays: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgram()
  }, [])

  const fetchProgram = async () => {
    try {
      const response = await apiClient.get("/programs/current")
      const data: ProgramData | null = response.data
      setProgram(data)
      if (data) {
        setProgress(loadProgress(data.id))
      }
    } catch (error) {
      console.error("Errore nel caricamento del programma", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="programdetail-page">
        <Container fluid className="px-3 px-md-4">
          <div className="text-center mt-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="programdetail-page">
        <Container fluid className="px-3 px-md-4">
          <div className="programdetail-header">
            <h1 className="programdetail-title">Nessun programma attivo</h1>
            <p className="programdetail-subtitle">
              Genera il tuo primo programma con l'AI Coach!
            </p>
          </div>
        </Container>
      </div>
    )
  }

  const totalDaysPerWeek = program.days.length
  const programComplete = checkProgramComplete(progress, program.weeksDuration)
  const currentWeekLabel = Math.min(progress.week, program.weeksDuration)

  const nextDayIndex = programComplete
    ? -1
    : getNextDayIndex(progress, totalDaysPerWeek)

  const currentDay =
    nextDayIndex >= 0 ? program.days[nextDayIndex] : program.days[0]

  const weekProgressPercent = programComplete
    ? 100
    : Math.round((progress.completedDays.length / totalDaysPerWeek) * 100)

  const startWorkout = () => {
    if (programComplete || nextDayIndex < 0) return
    navigate("/workout/start", {
      state: {
        programId: program.id,
        programName: program.name,
        style: program.style,
        day: currentDay,
        dayIndex: nextDayIndex,
        totalDaysPerWeek,
      },
    })
  }

  return (
    <div className="programdetail-page">
      <Container fluid className="px-3 px-md-4">
        <div className="programdetail-header">
          <div>
            <h1 className="programdetail-title">{program.name}</h1>
            <p className="programdetail-subtitle">
              {program.style} • {program.weeksDuration} Weeks Program
            </p>
          </div>
          <Button
            className="programdetail-start-btn"
            disabled={programComplete}
            onClick={startWorkout}
          >
            <i className="bi bi-play-circle-fill me-2"></i>
            {programComplete ? "Programma completato" : "Start Workout"}
          </Button>
        </div>

        <Row className="g-3 g-md-4 mb-4">
          <Col xs={12}>
            <div className="programdetail-days-nav">
              {program.days.map((day, idx) => {
                const isCompleted = progress.completedDays.includes(idx)
                const isCurrent = !programComplete && idx === nextDayIndex
                const isLocked = !isCompleted && !isCurrent

                return (
                  <button
                    key={day.id}
                    className={`programdetail-day-btn ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""} ${isLocked ? "locked" : ""}`}
                    disabled={!isCurrent}
                    title={
                      isCompleted
                        ? "Allenamento già completato questa settimana"
                        : isLocked
                          ? "Completa prima gli allenamenti precedenti"
                          : "Allenamento di oggi"
                    }
                  >
                    <span className="programdetail-day-name">
                      Day {day.dayIndex + 1}{" "}
                      {isCompleted && (
                        <i className="bi bi-check-circle-fill ms-1"></i>
                      )}
                      {isLocked && <i className="bi bi-lock-fill ms-1"></i>}
                    </span>
                    <span className="programdetail-day-title">{day.title}</span>
                  </button>
                )
              })}
            </div>
          </Col>
        </Row>

        <Row className="g-3 g-md-4">
          <Col lg={8}>
            <Card className="programdetail-card">
              <Card.Body>
                <div className="programdetail-day-header">
                  <div>
                    <h5 className="programdetail-day-title-main">
                      {currentDay.title}
                    </h5>
                    <p className="programdetail-day-meta">
                      {currentDay.exercises.length} exercises
                    </p>
                  </div>
                  <Badge className="programdetail-day-badge">
                    Day {currentDay.dayIndex + 1}
                  </Badge>
                </div>
                {programComplete && (
                  <p className="programdetail-day-meta mb-3">
                    <i className="bi bi-trophy-fill me-1"></i>
                    Hai completato tutte le settimane di questo programma!
                  </p>
                )}
                <div className="programdetail-exercise-list">
                  {currentDay.exercises.map((ex, idx) => (
                    <div key={ex.id} className="programdetail-exercise-item">
                      <div className="programdetail-exercise-info">
                        <div className="programdetail-exercise-header">
                          <span className="programdetail-exercise-number">
                            {idx + 1}
                          </span>
                          <span className="programdetail-exercise-name">
                            {ex.exercise.name}
                          </span>
                          <span className="programdetail-exercise-sets">
                            <i className="bi bi-arrow-repeat me-1"></i>
                            {ex.sets}×{ex.reps}
                          </span>
                          <span className="programdetail-exercise-rest">
                            <i className="bi bi-clock me-1"></i>
                            {ex.restSeconds}s
                          </span>
                        </div>
                        {ex.notes && (
                          <p className="programdetail-exercise-notes">
                            <i className="bi bi-lightbulb me-1"></i> {ex.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="programdetail-card">
              <Card.Body>
                <h5 className="programdetail-section-title">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Program Overview
                </h5>

                <div className="programdetail-overview-item">
                  <span className="programdetail-overview-label">
                    <i className="bi bi-tag-fill me-2"></i>Style
                  </span>
                  <span className="programdetail-overview-value">
                    <span className="programdetail-style-badge">
                      {program.style || "N/A"}
                    </span>
                  </span>
                </div>

                <div className="programdetail-overview-item">
                  <span className="programdetail-overview-label">
                    <i className={`bi ${getGoalIcon(program.goal)} me-2`}></i>
                    Goal
                  </span>
                  <span className="programdetail-overview-value">
                    <span className="programdetail-goal-badge">
                      {program.goal ? getGoalLabel(program.goal) : "N/A"}
                    </span>
                  </span>
                </div>

                <div className="programdetail-overview-item">
                  <span className="programdetail-overview-label">
                    <i className="bi bi-calendar-week-fill me-2"></i>Weeks
                  </span>
                  <span className="programdetail-overview-value">
                    {program.weeksDuration} settimane
                  </span>
                </div>

                <div className="programdetail-overview-item">
                  <span className="programdetail-overview-label">
                    <i className="bi bi-clock-fill me-2"></i>Days / Week
                  </span>
                  <span className="programdetail-overview-value">
                    {program.days.length} giorni
                  </span>
                </div>

                <div className="programdetail-overview-item">
                  <span className="programdetail-overview-label">
                    <i className="bi bi-dumbbell-fill me-2"></i>Total Exercises
                  </span>
                  <span className="programdetail-overview-value">
                    {program.days.reduce(
                      (acc, d) => acc + d.exercises.length,
                      0,
                    )}
                  </span>
                </div>

                <hr className="programdetail-divider" />

                <div className="programdetail-progress">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="programdetail-progress-label">
                      <i className="bi bi-graph-up-arrow me-1"></i>
                      Week Progress
                    </span>
                    <span className="programdetail-progress-value">
                      <strong>{currentWeekLabel}</strong> /{" "}
                      {program.weeksDuration}
                    </span>
                  </div>

                  <ProgressBar
                    now={weekProgressPercent}
                    className="programdetail-progress-bar"
                  />

                  <div className="programdetail-progress-labels">
                    <span>
                      {progress.completedDays.length} / {totalDaysPerWeek}{" "}
                      giorni
                    </span>
                    <span
                      className={
                        weekProgressPercent >= 100 ? "completed" : "current"
                      }
                    >
                      {weekProgressPercent >= 100 ? (
                        <>
                          <i className="bi bi-check-circle-fill me-1"></i>{" "}
                          Completato
                        </>
                      ) : (
                        `${weekProgressPercent}%`
                      )}
                    </span>
                  </div>
                </div>

                <hr className="programdetail-divider" />

                <div className="programdetail-mini-stats">
                  <div className="programdetail-mini-stat">
                    <div className="programdetail-mini-stat-label">
                      <i className="bi bi-calendar3-fill me-1"></i>Giorni totali
                    </div>
                    <div className="programdetail-mini-stat-value">
                      {program.days.length * program.weeksDuration} gg
                    </div>
                  </div>
                  <div className="programdetail-mini-stat">
                    <div className="programdetail-mini-stat-label">
                      <i className="bi bi-activity-fill me-1"></i>Esercizi
                      totali
                    </div>
                    <div className="programdetail-mini-stat-value">
                      {program.days.reduce(
                        (acc, d) => acc + d.exercises.length,
                        0,
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
