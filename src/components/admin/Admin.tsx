import { useEffect, useState } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
} from "react-bootstrap"
import { adminService } from "../../api/api"
import "./Admin.css"

interface AdminUser {
  id: string
  username: string
  email: string
  fullName: string
  isAdmin: boolean
}

export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    isAdmin: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await adminService.getUsers()
      setUsers(response.data)
    } catch (err) {
      console.error("Errore nel caricamento utenti", err)
      setError("Non hai i permessi per vedere questa pagina.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      fullName: user.fullName || "",
      email: user.email,
      isAdmin: user.isAdmin,
    })
    setShowEditModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setSaving(true)
    try {
      await adminService.updateUser(editingUser.id, formData)
      setShowEditModal(false)
      fetchUsers()
    } catch (err) {
      console.error("Errore nell'aggiornamento", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo utente?")) return
    try {
      await adminService.deleteUser(id)
      fetchUsers()
    } catch (err) {
      console.error("Errore nell'eliminazione", err)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
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

  if (error) {
    return (
      <div className="admin-page">
        <Container fluid className="px-3 px-md-4">
          <div className="alert alert-danger text-center">{error}</div>
        </Container>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Container fluid className="px-3 px-md-4">
        <div className="admin-header">
          <h1 className="admin-title">Pannello Admin</h1>
          <p className="admin-subtitle">Gestione utenti del database</p>
        </div>

        <Row className="g-3 g-md-4">
          <Col xs={12}>
            <Card className="admin-card">
              <Card.Body>
                <div className="table-responsive">
                  <Table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Nome Completo</th>
                        <th>Ruolo</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id.slice(0, 8)}...</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.fullName || "-"}</td>
                          <td>
                            {user.isAdmin ? (
                              <Badge bg="danger">Admin</Badge>
                            ) : (
                              <Badge bg="secondary">User</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-light"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(user)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifica Utente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Nome Completo</Form.Label>
              <Form.Control
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="È un Admin"
                checked={formData.isAdmin}
                onChange={(e) =>
                  setFormData({ ...formData, isAdmin: e.target.checked })
                }
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Annulla
              </Button>
              <Button type="submit" variant="danger" disabled={saving}>
                {saving ? "Salvando..." : "Salva"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
