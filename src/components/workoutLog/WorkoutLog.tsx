import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap"
import { Link } from "react-router-dom"
import apiClient from "../../api/api"
import "./WorkoutLog.css"

interface Workout {
  id: string
  sessionDate: string
  title: string
  intensity: string
  type: string
  exercises: unknown[]
  volume: number
  duration: number
}

export default function WorkoutLog() {
  const [filter, setFilter] = useState("all")
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const response = await apiClient.get("/workouts")
      setWorkouts(response.data)
    } catch (error) {
      console.error("Errore nel caricamento dei workout", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkouts =
    filter === "all"
      ? workouts
      : workouts.filter((w) => w.type.toLowerCase() === filter)

  if (loading) {
    return (
      <div className="workoutlog-page">
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

  return (
    <div className="workoutlog-page">
      <Container fluid className="px-3 px-md-4">
        <div className="workoutlog-header">
          <div>
            <h1 className="workoutlog-title">Workout Log</h1>
            <p className="workoutlog-subtitle">
              Tutte le tue sedute di allenamento
            </p>
          </div>
          <div className="workoutlog-stats">
            <div className="workoutlog-stat">
              <span className="workoutlog-stat-value">{workouts.length}</span>
              <span className="workoutlog-stat-label">Total Sessions</span>
            </div>
            <div className="workoutlog-stat">
              <span className="workoutlog-stat-value">
                {workouts
                  .reduce((acc, w) => acc + w.volume, 0)
                  .toLocaleString()}{" "}
                kg
              </span>
              <span className="workoutlog-stat-label">Total Volume</span>
            </div>
            <div className="workoutlog-stat">
              <span className="workoutlog-stat-value">
                {workouts.length > 0
                  ? (
                      workouts.reduce((acc, w) => acc + w.duration, 0) /
                      workouts.length
                    ).toFixed(1)
                  : 0}
              </span>
              <span className="workoutlog-stat-label">Avg Duration</span>
            </div>
          </div>
        </div>

        <Row className="g-3 g-md-4 mb-3">
          <Col xs={12}>
            <div className="workoutlog-filters">
              <Button
                variant={filter === "all" ? "primary" : "outline-light"}
                className="workoutlog-filter-btn"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "hypertrophy" ? "primary" : "outline-light"}
                className="workoutlog-filter-btn"
                onClick={() => setFilter("hypertrophy")}
              >
                Hypertrophy
              </Button>
              <Button
                variant={filter === "strength" ? "primary" : "outline-light"}
                className="workoutlog-filter-btn"
                onClick={() => setFilter("strength")}
              >
                Strength
              </Button>
              <Button
                variant={filter === "endurance" ? "primary" : "outline-light"}
                className="workoutlog-filter-btn"
                onClick={() => setFilter("endurance")}
              >
                Endurance
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="g-3 g-md-4">
          {filteredWorkouts.length === 0 && (
            <Col xs={12}>
              <Card className="workoutlog-card">
                <Card.Body>
                  Nessun allenamento salvato. Apri il tuo programma e premi
                  “Start Workout”.
                </Card.Body>
              </Card>
            </Col>
          )}
          {filteredWorkouts.map((workout) => (
            <Col key={workout.id} xs={12}>
              <Card className="workoutlog-card">
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="workoutlog-card-left">
                    <div className="workoutlog-card-date">
                      <span className="workoutlog-card-day">
                        {new Date(workout.sessionDate).toLocaleDateString(
                          "it-IT",
                          { weekday: "short" },
                        )}
                      </span>
                      <span className="workoutlog-card-date-text">
                        {new Date(workout.sessionDate).toLocaleDateString(
                          "it-IT",
                        )}
                      </span>
                    </div>
                    <h5 className="workoutlog-card-title">{workout.title}</h5>
                    <div className="workoutlog-card-meta">
                      <Badge bg="secondary" className="workoutlog-card-badge">
                        {workout.type}
                      </Badge>
                      <span className="workoutlog-card-meta-item">
                        <i className="bi bi-activity"></i>{" "}
                        {workout.exercises.length} exercises
                      </span>
                      <span className="workoutlog-card-meta-item">
                        <i className="bi bi-clock"></i> {workout.duration} min
                      </span>
                      <span className="workoutlog-card-meta-item">
                        <i className="bi bi-graph-up"></i>{" "}
                        {workout.volume.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                  <div className="workoutlog-card-right">
                    <div className="workoutlog-card-intensity">
                      <span
                        className={`workoutlog-intensity-dot intensity-${workout.intensity.toLowerCase().replace(" ", "-")}`}
                      ></span>
                      <span className="workoutlog-intensity-text">
                        {workout.intensity}
                      </span>
                    </div>
                    <Link to={`/workout/${workout.id}`}>
                      <Button className="workoutlog-view-btn">
                        View Details <i className="bi bi-arrow-right"></i>
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  )
}
