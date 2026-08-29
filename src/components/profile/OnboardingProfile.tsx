import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap"
import apiClient from "../../api/api"
import "../profile/Profile.css"

export default function OnboardingProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    heightCm: "",
    weightKg: "",
    trainingExperienceYears: "0",
    trainingStyle: "hypertrophy",
    daysPerWeek: "3",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }
    setInitialLoading(false)
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiClient.put("/users/me", {
        fullName: formData.fullName || null,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : null,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        trainingExperienceYears: formData.trainingExperienceYears
          ? parseInt(formData.trainingExperienceYears)
          : null,
        trainingStyle: formData.trainingStyle,
        daysPerWeek: formData.daysPerWeek
          ? parseInt(formData.daysPerWeek)
          : null,
      })
      navigate("/dashboard")
    } catch (err: any) {
      console.error("Errore nel salvataggio del profilo", err)
      setError(
        err.response?.data?.message || "Errore nel salvataggio. Riprova.",
      )
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="profile-page">
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
    <div className="profile-page">
      <Container fluid className="px-3 px-md-4">
        <div className="profile-header">
          <h1 className="profile-title">Completa il tuo Profilo</h1>
          <p className="profile-subtitle">
            Fornisci questi dati per ottenere una scheda personalizzata.
          </p>
        </div>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="profile-card">
              <Card.Body>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <h5 className="profile-section-title">
                  Dati fisici e preferenze
                </h5>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="profile-label">
                          Nome Completo
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          placeholder="Il tuo nome"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="profile-label">
                          Data di Nascita
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="profile-label">
                          Altezza (cm)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="heightCm"
                          placeholder="es. 178"
                          value={formData.heightCm}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="profile-label">
                          Peso (kg)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="weightKg"
                          placeholder="es. 75"
                          value={formData.weightKg}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="profile-label">
                          Anni di esperienza
                        </Form.Label>
                        <Form.Select
                          name="trainingExperienceYears"
                          value={formData.trainingExperienceYears}
                          onChange={handleChange}
                          className="profile-input"
                        >
                          <option value="0">Meno di 1 anno</option>
                          <option value="1">1 anno</option>
                          <option value="2">2 anni</option>
                          <option value="3">3 anni</option>
                          <option value="5">5+ anni</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="profile-label">
                          Stile preferito
                        </Form.Label>
                        <Form.Select
                          name="trainingStyle"
                          value={formData.trainingStyle}
                          onChange={handleChange}
                          className="profile-input"
                        >
                          <option value="hypertrophy">
                            Ipertrofia (Massa)
                          </option>
                          <option value="strength">Forza</option>
                          <option value="endurance">Resistenza</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="profile-label">
                          Giorni di allenamento a settimana
                        </Form.Label>
                        <Form.Select
                          name="daysPerWeek"
                          value={formData.daysPerWeek}
                          onChange={handleChange}
                          className="profile-input"
                        >
                          <option value="2">2 giorni</option>
                          <option value="3">3 giorni</option>
                          <option value="4">4 giorni</option>
                          <option value="5">5 giorni</option>
                          <option value="6">6 giorni</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    className="profile-save-btn w-100 mt-3"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salva e vai alla Dashboard"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
