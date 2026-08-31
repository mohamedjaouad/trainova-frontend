import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Container, Navbar, Nav } from "react-bootstrap"
import logo from "../../../assets/Logo.png"
import apiClient from "../../../api/api"
import "./NavBar.css"

export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [user, setUser] = useState<{
    fullName: string
    avatarUrl: string | null
  } | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    apiClient
      .get("/users/me")
      .then((response) => {
        setUser({
          fullName: response.data.fullName || response.data.username,
          avatarUrl: response.data.avatarUrl || null,
        })
      })
      .catch(() => setUser(null))
  }, [])

  const isAdmin = localStorage.getItem("isAdmin") === "true"

  const navLinks = [
    ...(isAdmin
      ? [{ path: "/admin", label: "Admin", icon: "bi-shield-lock-fill" }]
      : []),
    { path: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
    { path: "/ai-coach", label: "AI Coach", icon: "bi-cpu-fill" },
    { path: "/workout-log", label: "Workouts", icon: "bi bi-activity" },
    { path: "/program-detail", label: "Program", icon: "bi-file-text-fill" },
    { path: "/profile", label: "Profile", icon: "bi-person-fill" },
  ]

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/") return true
    return location.pathname.startsWith(path)
  }

  const getInitials = () => {
    if (!user) return "?"
    const name = user.fullName || "?"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const handleAvatarClick = () => {
    setExpanded(false)
    navigate("/profile")
  }

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`navbar-custom ${scrolled ? "navbar-scrolled" : ""}`}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container fluid className="px-3 px-md-4">
        <Navbar.Brand as={Link} to="/dashboard" className="navbar-brand-custom">
          <img src={logo} alt="Trainova" className="navbar-logo-img" />
          <span className="navbar-brand-text">TRAINOVA</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="navbar-nav"
          className="navbar-toggler-custom border-0"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="navbar-toggler-icon-custom">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </Navbar.Toggle>

        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav className="align-items-lg-center gap-1">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.path}
                as={Link}
                to={link.path}
                className={`nav-link-custom ${isActive(link.path) ? "active" : ""}`}
                onClick={() => setExpanded(false)}
                style={{ textDecoration: "none" }}
              >
                <i className={`bi ${link.icon}`} style={{ marginRight: 5 }}></i>
                <span>{link.label}</span>
                {isActive(link.path) && <span className="nav-link-glow"></span>}
              </Nav.Link>
            ))}

            <div className="nav-right-items d-flex align-items-center gap-2 ms-lg-3">
              <div
                className="nav-avatar"
                onClick={handleAvatarClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleAvatarClick()
                  }
                }}
                title="Vai al profilo"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="nav-avatar-img"
                  />
                ) : (
                  <span className="nav-avatar-text">{getInitials()}</span>
                )}
              </div>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
