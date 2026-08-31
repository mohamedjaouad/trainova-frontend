import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../../api/api"
import bgLogin from "../../assets/Background.jpg"
import logo from "../../assets/Logo.png"
import "./Auth.css"

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [flip, setFlip] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const response = await authService.login({ email, password })
      const token = response.data.token
      if (token) {
        localStorage.setItem("token", token)

        let isAdmin = response.data.isAdmin
        if (isAdmin === undefined) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            isAdmin = payload.isAdmin || false
          } catch {
            isAdmin = false
          }
        }

        localStorage.setItem("isAdmin", String(isAdmin))

        navigate("/dashboard")
      } else {
        setError("Token non ricevuto. Riprova.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Credenziali errate. Riprova.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Le password non coincidono.")
      return
    }
    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.")
      return
    }
    const hasNumber = /\d/.test(password)
    if (!hasNumber) {
      setError("La password deve contenere almeno un numero.")
      return
    }

    const hasSpecialChar = /[^a-zA-Z0-9\s]/.test(password)
    if (!hasSpecialChar) {
      setError(
        "La password deve contenere almeno un carattere speciale (es. !@#$%^&*).",
      )
      return
    }
    setLoading(true)
    try {
      const registerResponse = await authService.register({
        name,
        email,
        password,
      })
      console.log("Registrazione completata:", registerResponse.data)

      const loginResponse = await authService.login({ email, password })
      const token = loginResponse.data.token
      if (token) {
        localStorage.setItem("token", token)

        let isAdmin = loginResponse.data.isAdmin
        if (isAdmin === undefined) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            isAdmin = payload.isAdmin || false
          } catch {
            isAdmin = false
          }
        }

        localStorage.setItem("isAdmin", String(isAdmin))

        navigate("/profile/onboarding")
      } else {
        setError("Login automatico fallito. Riprova.")
        navigate("/login")
      }
    } catch (err: any) {
      console.error("Errore registrazione:", err)
      setError(
        err.response?.data?.message || "Errore durante la registrazione.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bgLogin})` }}>
      <div className="login-vignette"></div>
      <div className="logo-box">
        <img src={logo} alt="Trainova Logo" />
      </div>
      <div className={`login-card flip-container ${flip ? "flip-active" : ""}`}>
        <div className="card-glow"></div>
        <div className="login-tabs">
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login")
              setFlip(false)
              setError("")
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("register")
              setFlip(true)
              setError("")
            }}
            type="button"
          >
            Register
          </button>
        </div>
        <div className="flip-inner">
          <div className="flip-face flip-front">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Log in to continue your journey.</p>
            <form onSubmit={handleLogin}>
              {error && (
                <div className="text-danger mb-3" style={{ fontSize: "13px" }}>
                  {error}
                </div>
              )}
              <label className="field-label">Email</label>
              <div className="input-wrap">
                <i className="bi bi-envelope"></i>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <label className="field-label">Password</label>
              <div className="input-wrap">
                <i className="bi bi-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} toggle-eye`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              <button className="login-btn" type="submit" disabled={loading}>
                <span>{loading ? "LOGGING IN..." : "LOGIN"}</span>
              </button>
            </form>
          </div>
          <div className="flip-face flip-back">
            <h2 className="login-title">Join Trainova</h2>
            <p className="login-subtitle">Start your transformation today.</p>
            <form onSubmit={handleRegister}>
              {error && (
                <div className="text-danger mb-3" style={{ fontSize: "13px" }}>
                  {error}
                </div>
              )}
              <label className="field-label">Full Name</label>
              <div className="input-wrap">
                <i className="bi bi-person"></i>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <label className="field-label">Email</label>
              <div className="input-wrap">
                <i className="bi bi-envelope"></i>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <label className="field-label">Password</label>
              <div className="input-wrap">
                <i className="bi bi-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} toggle-eye`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              <label className="field-label">Confirm Password</label>
              <div className="input-wrap">
                <i className="bi bi-lock"></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <i
                  className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} toggle-eye`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
              <button className="login-btn" type="submit" disabled={loading}>
                <span>{loading ? "CREATING..." : "CREATE ACCOUNT"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
