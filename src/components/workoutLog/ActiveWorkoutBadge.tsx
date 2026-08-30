import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { loadActiveWorkout } from "./activestorage"
import "./activebadge.css"

export default function ActiveWorkoutBadge() {
  const navigate = useNavigate()
  const location = useLocation()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [title, setTitle] = useState<string | null>(null)

  useEffect(() => {
    const check = () => {
      const active = loadActiveWorkout()
      if (active) {
        setElapsedSeconds(Math.floor((Date.now() - active.startedAt) / 1000))
        setTitle(active.day.title)
      } else {
        setTitle(null)
      }
    }

    check()
    const timer = window.setInterval(check, 1000)
    return () => window.clearInterval(timer)
  }, [location.pathname])

  if (!title || location.pathname === "/workout/start") return null
  if (!localStorage.getItem("token")) return null

  const formatted = `${String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`

  return (
    <button
      className="active-workout-badge"
      onClick={() => navigate("/workout/start")}
      title={`Torna a: ${title}`}
    >
      <span className="active-workout-badge-time">{formatted}</span>
    </button>
  )
}
