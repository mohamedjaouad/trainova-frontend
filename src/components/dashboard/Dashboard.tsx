import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Button, ProgressBar } from "react-bootstrap"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import apiClient from "../../api/api"
import {
  loadProgress,
  getNextDayIndex,
  isProgramComplete,
  type ProgramProgress,
} from "../programDetail/ProgramProgress"
import "./Dashboard.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Workout {
  id: string
  sessionDate: string
  volume: number
}
interface ProgramDay {
  id: string
  title: string
  exercises: unknown[]
}
interface Program {
  id: string
  name: string
  style: string
  weeksDuration: number
  createdAt: string
  days: ProgramDay[]
}

const dateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [program, setProgram] = useState<Program | null>(null)
  const [progress, setProgress] = useState<ProgramProgress>({
    week: 1,
    completedDays: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [workoutsRes, programRes] = await Promise.all([
          apiClient.get("/workouts"),
          apiClient.get("/programs/current"),
        ])
        setWorkouts(workoutsRes.data || [])
        const loadedProgram: Program | null = programRes.data || null
        setProgram(loadedProgram)
        if (loadedProgram) {
          setProgress(loadProgress(loadedProgram.id))
        }
      } catch (err: any) {
        console.error("Errore nel caricamento della dashboard:", err)
        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/login")
          return
        }
        setError("Errore nel caricamento dei dati. Riprova.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const activity = useMemo(() => {
    const completed = new Set(
      workouts.map((workout) => dateKey(new Date(workout.sessionDate))),
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const mondayIndex = (d: Date) => (d.getDay() + 6) % 7

    const currentMonday = new Date(today)
    currentMonday.setDate(currentMonday.getDate() - mondayIndex(today))

    const startMonday = new Date(currentMonday)
    startMonday.setDate(startMonday.getDate() - 21)

    const days = Array.from({ length: 28 }, (_, index) => {
      const date = new Date(startMonday)
      date.setDate(date.getDate() + index)
      const isFuture = date.getTime() > today.getTime()
      return {
        date,
        status: isFuture
          ? "future"
          : completed.has(dateKey(date))
            ? "done"
            : "rest",
      }
    })

    const realDays = days.filter((day) => day.status !== "future")

    let streak = 0
    for (
      let index = realDays.length - 1;
      index >= 0 && realDays[index].status === "done";
      index--
    )
      streak++

    return {
      days,
      realDays,
      streak,
      weekDone: realDays.slice(-7).filter((day) => day.status === "done")
        .length,
    }
  }, [workouts])

  const barData = {
    labels: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
    datasets: [
      {
        label: "Allenamenti",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#c41e3a",
        borderRadius: 4,
      },
    ],
  }

  const currentWeekDays = activity.realDays.slice(-7)
  const mondayIndex = (new Date().getDay() + 6) % 7
  const currentMonday = new Date()
  currentMonday.setDate(currentMonday.getDate() - mondayIndex)
  currentMonday.setHours(0, 0, 0, 0)

  const currentWeekData = [0, 0, 0, 0, 0, 0, 0]
  currentWeekDays.forEach((day) => {
    const dayOfWeekIndex = (day.date.getDay() + 6) % 7
    if (day.status === "done") {
      currentWeekData[dayOfWeekIndex] = 1
    }
  })

  barData.datasets[0].data = currentWeekData

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#9ba0a5" } } },
    scales: {
      x: { ticks: { color: "#9ba0a5" } },
      y: { beginAtZero: true, ticks: { color: "#9ba0a5", stepSize: 1 } },
    },
  }

  const activeDays = activity.realDays.filter(
    (day) => day.status === "done",
  ).length
  const totalVolume = workouts.reduce((sum, w) => sum + (w.volume || 0), 0)

  const programComplete = program
    ? isProgramComplete(progress, program.weeksDuration)
    : false

  const programProgress = program
    ? programComplete
      ? 100
      : Math.round((progress.completedDays.length / program.days.length) * 100)
    : 0

  const nextDayIndex = program
    ? getNextDayIndex(progress, program.days.length)
    : -1

  const nextDay =
    program?.days && program.days.length > 0 && !programComplete
      ? program.days[nextDayIndex]
      : null

  if (loading) {
    return (
      <div className="dashboard-page">
        <Container fluid className="px-3 px-md-4">
          <div className="text-center mt-5 pt-5">
            <div
              className="spinner-border text-danger"
              role="status"
              style={{ width: "50px", height: "50px" }}
            >
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <p className="mt-3 text-secondary">Caricamento dashboard...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Container fluid className="px-3 px-md-4">
          <div className="mt-5">
            <div className="alert alert-danger text-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
            <div className="text-center mt-3">
              <Button
                variant="outline-light"
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Riprova
              </Button>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <Container fluid className="px-3 px-md-4">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Benvenuto! Ecco il riepilogo dei tuoi allenamenti.
            </p>
          </div>
        </div>

        <Row className="g-3 g-md-4">
          <Metric
            label="Total Workouts"
            value={String(workouts.length)}
            icon="bi-activity"
            detail="Sessioni salvate"
          />
          <Metric
            label="Questa settimana"
            value={`${activity.weekDone}/7`}
            icon="bi-check2-circle"
            detail="Giorni con allenamento"
          />
          <Metric
            label="Volume totale"
            value={`${totalVolume.toLocaleString()} kg`}
            icon="bi-bar-chart"
            detail="Dalle sessioni salvate"
          />
          <Metric
            label="Streak"
            value={`${activity.streak} giorni`}
            icon="bi-fire"
            detail="Giorni consecutivi"
          />
        </Row>

        <Row className="g-3 g-md-4 mt-2">
          <Col lg={6}>
            <div
              className={`flip-card-container ${flipped ? "flipped" : ""}`}
              style={{ position: "relative" }}
            >
              <button
                className="chart-flip-btn"
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  zIndex: 10,
                }}
                onClick={() => setFlipped(!flipped)}
              >
                <i
                  className={`bi ${flipped ? "bi-calendar-week" : "bi-bar-chart"}`}
                ></i>
                {flipped ? " Costanza" : " Attività settimanale"}
              </button>

              <div className="flip-card-inner">
                <div className="flip-card-face flip-card-front">
                  <Card
                    className="dashboard-chart-card"
                    style={{ height: "100%" }}
                  >
                    <Card.Body>
                      <h5 className="dashboard-chart-title">Costanza</h5>
                      <p className="dashboard-heatmap-sub">
                        Ultime 4 settimane · {activeDays} giorni attivi
                      </p>
                      <div className="dashboard-heatmap">
                        <div className="dashboard-heatmap-weekdays">
                          <span>L</span>
                          <span>M</span>
                          <span>M</span>
                          <span>G</span>
                          <span>V</span>
                          <span>S</span>
                          <span>D</span>
                        </div>
                        <div className="dashboard-heatmap-grid">
                          {activity.days.map((day) => (
                            <span
                              key={dateKey(day.date)}
                              className={`dashboard-heatmap-cell ${day.status}`}
                              title={day.date.toLocaleDateString("it-IT")}
                            />
                          ))}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>

                <div className="flip-card-face flip-card-back">
                  <Card
                    className="dashboard-chart-card"
                    style={{ height: "100%" }}
                  >
                    <Card.Body>
                      <h5 className="dashboard-chart-title mb-3">
                        Attività settimanale
                      </h5>
                      <div style={{ height: "180px" }}>
                        <Bar data={barData} options={options} />
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={6}>
            <Row className="g-3">
              <Col xs={12}>
                <Card className="dashboard-program-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="dashboard-program-title">
                          Programma attivo
                        </h5>
                        {program ? (
                          <>
                            <p className="dashboard-program-name">
                              {program.name}
                            </p>

                            <div style={{ maxWidth: "280px" }}>
                              <div className="d-flex justify-content-between">
                                <span
                                  className="text-secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  Progresso
                                </span>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#c41e3a",
                                    fontWeight: "600",
                                  }}
                                >
                                  {programProgress}%
                                </span>
                              </div>
                              <ProgressBar
                                now={programProgress}
                                className="dashboard-progress-bar"
                              />
                            </div>
                          </>
                        ) : (
                          <p className="dashboard-program-meta">
                            Nessun programma attivo.
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline-light"
                        className="dashboard-program-btn"
                        onClick={() =>
                          navigate(program ? "/program-detail" : "/ai-coach")
                        }
                      >
                        {program ? "Vedi programma" : "Genera"}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12}>
                <Card className="dashboard-workout-card">
                  <Card.Body>
                    {program && nextDay ? (
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="dashboard-workout-badge">
                            Prossimo allenamento
                          </span>
                          <h5 className="dashboard-workout-name">
                            {nextDay.title}
                          </h5>
                          <div className="dashboard-workout-stats">
                            <span>
                              <i className="bi bi-list-check"></i>{" "}
                              {nextDay.exercises.length} esercizi
                            </span>
                          </div>
                        </div>
                        <Button
                          className="dashboard-workout-btn"
                          onClick={() =>
                            navigate("/workout/start", {
                              state: {
                                programId: program.id,
                                programName: program.name,
                                style: program.style,
                                day: nextDay,
                                dayIndex: nextDayIndex,
                                totalDaysPerWeek: program.days.length,
                              },
                            })
                          }
                        >
                          START WORKOUT
                        </Button>
                      </div>
                    ) : (
                      <p className="dashboard-workout-meta">
                        {!program
                          ? "Genera un programma per iniziare un allenamento."
                          : programComplete
                            ? "Complimenti, hai completato tutte le settimane del programma!"
                            : "Nessun giorno disponibile."}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

function Metric({
  label,
  value,
  icon,
  detail,
}: {
  label: string
  value: string
  icon: string
  detail: string
}) {
  return (
    <Col xs={12} sm={6} lg={3}>
      <Card className="dashboard-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="dashboard-card-label">{label}</p>
              <h2 className="dashboard-card-value">{value}</h2>
              <span className="dashboard-card-change up">{detail}</span>
            </div>
            <div className="dashboard-card-icon">
              <i className={`bi ${icon}`}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  )
}
