import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Card, Badge, Table } from "react-bootstrap"
import apiClient from "../../api/api"
import "./WorkoutDetail.css"

export default function WorkoutDetail() {
  const { id } = useParams()
  const [workout, setWorkout] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkout()
  }, [id])

  const fetchWorkout = async () => {
    try {
      const response = await apiClient.get(`/workouts/${id}`)
      setWorkout(response.data)
    } catch (error) {
      console.error("Errore nel caricamento del workout", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="workoutdetail-page">
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

  if (!workout) {
    return (
      <div className="workoutdetail-page">
        <Container fluid className="px-3 px-md-4">
          <div className="workoutdetail-header">
            <div className="workoutdetail-breadcrumb">
              <Link to="/workout-log" className="workoutdetail-back">
                <i className="bi bi-arrow-left"></i> Back to Workout Log
              </Link>
            </div>
            <h1 className="workoutdetail-title">Workout non trovato</h1>
            <p className="workoutdetail-subtitle">
              Il workout richiesto non esiste.
            </p>
          </div>
        </Container>
      </div>
    )
  }

  const totalVolume = workout.volume || 0
  const durationMin = workout.duration || 0

  const totalSets = (workout.exercises ?? []).reduce(
    (acc: number, ex: any) => acc + (ex.sets ?? 0),
    0,
  )

  const totalReps = (workout.exercises ?? []).reduce(
    (acc: number, ex: any) =>
      acc + (parseInt(ex.reps, 10) || 0) * (ex.sets ?? 0),
    0,
  )

  const estimatedCalories = Math.round(
    totalVolume / 10 + durationMin * 5 + totalSets * 2,
  )

  return (
    <div className="workoutdetail-page">
      <Container fluid className="px-3 px-md-4">
        <div className="workoutdetail-header">
          <div>
            <div className="workoutdetail-breadcrumb">
              <Link to="/workout-log" className="workoutdetail-back">
                <i className="bi bi-arrow-left"></i> Back to Workout Log
              </Link>
            </div>
            <h1 className="workoutdetail-title">{workout.title}</h1>
            <p className="workoutdetail-subtitle">
              {new Date(workout.sessionDate).toLocaleDateString("it-IT")}
            </p>
          </div>
          <div className="workoutdetail-actions">
            <Badge bg="secondary" className="workoutdetail-type-badge">
              {workout.type}
            </Badge>
            <Badge className="workoutdetail-intensity-badge">
              {workout.intensity}
            </Badge>
          </div>
        </div>

        <Row className="g-3 g-md-4 mb-4">
          <Col xs={6} sm={3}>
            <Card className="workoutdetail-stat-card">
              <Card.Body className="text-center">
                <p className="workoutdetail-stat-label">Duration</p>
                <h4 className="workoutdetail-stat-value">
                  {workout.duration} min
                </h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="workoutdetail-stat-card">
              <Card.Body className="text-center">
                <p className="workoutdetail-stat-label">Volume</p>
                <h4 className="workoutdetail-stat-value">
                  {totalVolume.toLocaleString()} kg
                </h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="workoutdetail-stat-card">
              <Card.Body className="text-center">
                <p className="workoutdetail-stat-label">Calories</p>
                <h4 className="workoutdetail-stat-value">
                  {estimatedCalories} kcal
                </h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={3}>
            <Card className="workoutdetail-stat-card">
              <Card.Body className="text-center">
                <p className="workoutdetail-stat-label">Exercises</p>
                <h4 className="workoutdetail-stat-value">
                  {(workout.exercises ?? []).length}
                </h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 g-md-4">
          <Col lg={8}>
            <Card className="workoutdetail-card">
              <Card.Body>
                <h5 className="workoutdetail-section-title">Exercises</h5>
                {!workout.exercises || workout.exercises.length === 0 ? (
                  <p className="workoutdetail-subtitle mb-0">
                    Nessun esercizio registrato per questo allenamento.
                  </p>
                ) : (
                  <div className="workoutdetail-table-wrap">
                    <Table className="workoutdetail-table">
                      <thead>
                        <tr>
                          <th>Exercise</th>
                          <th>Sets</th>
                          <th>Reps</th>
                          <th>Weight</th>
                          <th>Rest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workout.exercises.map((ex: any, idx: number) => (
                          <tr key={ex.id ?? idx}>
                            <td className="workoutdetail-exercise-name">
                              {ex.exercise?.name ?? "Esercizio sconosciuto"}
                            </td>
                            <td>{ex.sets ?? "-"}</td>
                            <td>{ex.reps ?? "-"}</td>
                            <td>{ex.weight ?? "-"}</td>
                            <td>{ex.rest ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="workoutdetail-card">
              <Card.Body>
                <h5 className="workoutdetail-section-title">Summary</h5>
                <div className="workoutdetail-summary-item">
                  <span className="workoutdetail-summary-label">
                    Total Sets
                  </span>
                  <span className="workoutdetail-summary-value">
                    {totalSets}
                  </span>
                </div>
                <div className="workoutdetail-summary-item">
                  <span className="workoutdetail-summary-label">
                    Total Reps
                  </span>
                  <span className="workoutdetail-summary-value">
                    {totalReps}
                  </span>
                </div>
                <div className="workoutdetail-summary-item">
                  <span className="workoutdetail-summary-label">
                    Average Weight
                  </span>
                  <span className="workoutdetail-summary-value">
                    {workout.exercises && workout.exercises.length > 0
                      ? `~${Math.round(workout.volume / workout.exercises.length / 3)} kg`
                      : "-"}
                  </span>
                </div>
                <div className="workoutdetail-summary-item">
                  <span className="workoutdetail-summary-label">Calories</span>
                  <span className="workoutdetail-summary-value">
                    {estimatedCalories} kcal
                  </span>
                </div>

                <hr className="workoutdetail-divider" />

                <div className="workoutdetail-notes">
                  <h6 className="workoutdetail-notes-title">Notes</h6>
                  <p className="workoutdetail-notes-text">{workout.notes}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
