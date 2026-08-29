import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap"
import apiClient from "../../api/api"
import "./Profile.css"

interface UserData {
  id: string
  username: string
  email: string
  fullName: string
  avatarUrl: string | null
  dateOfBirth: string | null
  heightCm: number | null
  weightKg: number | null
  trainingExperienceYears: number | null
  trainingStyle: string | null
  daysPerWeek: number | null
  level: number
  xp: number
}

export default function Profile() {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/users/me")
      setUser(response.data)

      setFormData({
        fullName: response.data.fullName || "",
        dateOfBirth: response.data.dateOfBirth
          ? response.data.dateOfBirth.split("T")[0]
          : "",
        heightCm: response.data.heightCm || "",
        weightKg: response.data.weightKg || "",
        trainingExperienceYears: response.data.trainingExperienceYears || "0",
        trainingStyle: response.data.trainingStyle || "hypertrophy",
        daysPerWeek: response.data.daysPerWeek || "3",
      })
    } catch (error) {
      console.error("Errore nel caricamento del profilo", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.put("/users/me", {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth)
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
      setEditing(false)
      fetchProfile()
    } catch (err) {
      console.error("Errore nel salvataggio del profilo", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Per favore seleziona un'immagine valida.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'immagine non deve superare i 5MB.")
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const response = await apiClient.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setUser(response.data)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Errore nel caricamento dell'avatar", error)
      alert("Errore nel caricamento dell'immagine. Riprova.")
    } finally {
      setUploading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/login", { replace: true })
  }

  if (loading) {
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

  if (!user) {
    return <div>Errore nel caricamento del profilo.</div>
  }

  const displayName = user.fullName || user.username
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const age = user.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(user.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      )
    : null

  return (
    <div className="profile-page">
      <Container fluid className="px-3 px-md-4">
        <div className="profile-header">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">
            Gestisci i tuoi dati personali e le tue preferenze
          </p>
        </div>

        <Row className="g-3 g-md-4">
          <Col lg={4}>
            <Card className="profile-card profile-summary-card">
              <Card.Body className="text-center">
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="profile-avatar-img"
                      />
                    ) : (
                      <span className="profile-avatar-text">{initials}</span>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="profile-avatar-upload-btn"
                  >
                    <i className="bi bi-camera-fill"></i>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                  {uploading && (
                    <div className="profile-avatar-uploading">
                      <div className="spinner-border spinner-border-sm text-danger" />
                    </div>
                  )}
                </div>

                <h3 className="profile-name">{displayName}</h3>
                <p className="profile-email">{user.email}</p>

                <div className="profile-stats-grid">
                  <div className="profile-stat">
                    <span className="profile-stat-value">{user.level}</span>
                    <span className="profile-stat-label">Livello</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-value">{user.xp}</span>
                    <span className="profile-stat-label">XP</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-value">
                      {user.daysPerWeek || "-"}
                    </span>
                    <span className="profile-stat-label">Giorni/Sett</span>
                  </div>
                </div>

                <Button
                  variant="outline-light"
                  className="profile-edit-btn"
                  onClick={() => setEditing(!editing)}
                >
                  <i className="bi bi-pencil"></i>{" "}
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
                <Button
                  variant="outline-danger"
                  className="profile-edit-btn ms-2"
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right"></i> Esci
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="profile-card">
              <Card.Body>
                <h5 className="profile-section-title">Personal Information</h5>

                {editing ? (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="profile-label">
                            Full Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="profile-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="profile-label">
                            Email
                          </Form.Label>
                          <Form.Control
                            type="email"
                            value={user.email}
                            className="profile-input"
                            disabled
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
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
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="profile-label">
                            Weight (kg)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="weightKg"
                            value={formData.weightKg}
                            onChange={handleChange}
                            className="profile-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="profile-label">
                            Height (cm)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="heightCm"
                            value={formData.heightCm}
                            onChange={handleChange}
                            className="profile-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="profile-label">
                            Esperienza (anni)
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
                            Stile
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
                    </Row>
                    <Button
                      className="profile-save-btn"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : "Save Changes"}
                    </Button>
                  </Form>
                ) : (
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="profile-info-label">Full Name</span>
                      <span className="profile-info-value">
                        {user.fullName || "-"}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Email</span>
                      <span className="profile-info-value">{user.email}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Age</span>
                      <span className="profile-info-value">
                        {age !== null ? `${age} years` : "-"}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Weight</span>
                      <span className="profile-info-value">
                        {user.weightKg ? `${user.weightKg} kg` : "-"}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Height</span>
                      <span className="profile-info-value">
                        {user.heightCm ? `${user.heightCm} cm` : "-"}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Goal</span>
                      <span className="profile-info-value">
                        {user.trainingStyle === "strength"
                          ? "Forza"
                          : user.trainingStyle === "endurance"
                            ? "Resistenza"
                            : user.trainingStyle === "hypertrophy"
                              ? "Aumentare massa"
                              : "-"}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Days / Week</span>
                      <span className="profile-info-value">
                        {user.daysPerWeek || "-"}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Experience</span>
                      <span className="profile-info-value">
                        {user.trainingExperienceYears
                          ? `${user.trainingExperienceYears} years`
                          : "-"}
                      </span>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
