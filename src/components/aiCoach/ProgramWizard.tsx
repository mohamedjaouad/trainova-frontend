import { useState } from "react"
import { isAxiosError } from "axios"
import apiClient from "../../api/api"
import "./ProgramWizard.css"

const STEPS = ["goal", "level", "days", "equipment", "style"]

const GOALS = [
  { id: "muscle", label: "Aumentare massa", icon: "bi-arrows-expand" },
  { id: "fatloss", label: "Perdere grasso", icon: "bi-fire" },
  { id: "strength", label: "Aumentare la forza", icon: "bi-lightning-charge" },
  { id: "endurance", label: "Migliorare resistenza", icon: "bi-heart-pulse" },
]

const LEVELS = ["Beginner", "Intermediate", "Advanced"]

const EQUIPMENT = [
  "Bilanciere",
  "Manubri",
  "Kettlebell",
  "Power Rack",
  "Cavi/Macchine",
  "Bande elastiche",
  "Corpo libero",
]

const STYLES = [
  { id: "strength", label: "Forza", desc: "Serie basse, carichi alti" },
  {
    id: "hypertrophy",
    label: "Ipertrofia",
    desc: "Volume alto, focus muscolare",
  },
  { id: "endurance", label: "Resistenza", desc: "Reps alte, recuperi brevi" },
]

interface Answers {
  goal: string | null
  level: string | null
  days: number | null
  equipment: string[]
  style: string | null
}

interface ProgramResult {
  id: string
  name: string
  goal: string
  style: string
  daysPerWeek: number
  weeksDuration: number
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
    }[]
  }[]
}

export default function ProgramWizard() {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({
    goal: null,
    level: null,
    days: null,
    equipment: [],
    style: null,
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<ProgramResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const step = STEPS[stepIndex]
  const progressPct = (stepIndex / STEPS.length) * 100

  function select(field: keyof Answers, value: string | number) {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  function toggleEquipment(item: string) {
    setAnswers((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }))
  }

  function canProceed(): boolean {
    if (step === "goal") return !!answers.goal
    if (step === "level") return !!answers.level
    if (step === "days") return !!answers.days
    if (step === "equipment") return answers.equipment.length > 0
    if (step === "style") return !!answers.style
    return false
  }

  function next() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      generate()
    }
  }

  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  async function generate() {
    setGenerating(true)
    setErrorMessage(null)
    try {
      // FIX: prima chiamava POST /programs/generate. Lato backend quel
      // path ora è il generatore a template puro (senza AI), mentre
      // /programs/generate-ai è l'endpoint che chiama l'AI con fallback
      // automatico al template in caso di errore — è il comportamento
      // che questo wizard vuole offrire (vedi il messaggio di caricamento
      // "Trainova Coach sta costruendo il tuo programma...").
      const response = await apiClient.post("/programs/generate-ai", {
        goal: answers.goal,
        level: answers.level,
        daysPerWeek: answers.days,
        equipment: answers.equipment,
        style: answers.style,
      })
      setResult(response.data)
    } catch (error) {
      console.error("Errore nella generazione della scheda:", error)
      setErrorMessage(
        isAxiosError(error)
          ? (error.response?.data?.message ??
              "Non e' stato possibile generare la scheda. Riprova.")
          : "Non e' stato possibile generare la scheda. Riprova.",
      )
    } finally {
      setGenerating(false)
    }
  }

  function restart() {
    setStepIndex(0)
    setAnswers({
      goal: null,
      level: null,
      days: null,
      equipment: [],
      style: null,
    })
    setResult(null)
  }

  if (generating) {
    return (
      <div className="pw-generating">
        <div className="pw-spinner"></div>
        <p>Trainova Coach sta costruendo il tuo programma...</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="pw-result">
        <div className="pw-result-header">
          <i className="bi bi-check-circle-fill"></i>
          <div>
            <h2>Scheda generata</h2>
            <p>
              Basata su {result.daysPerWeek} giorni/settimana, focus{" "}
              {STYLES.find((s) => s.id === result.style)?.label}
            </p>
          </div>
        </div>
        <div className="pw-result-days">
          {result.days.map((d) => (
            <div key={d.id} className="pw-result-day">
              <span className="pw-result-day-label">Day {d.dayIndex + 1}</span>
              <span className="pw-result-day-title">{d.title}</span>
              <span className="pw-result-day-meta">
                {d.exercises.length} esercizi
              </span>
            </div>
          ))}
        </div>
        <div className="pw-result-actions">
          <button className="pw-btn-outline" onClick={restart}>
            Genera un altro
          </button>
          <button
            className="pw-btn-fill"
            onClick={() => (window.location.href = "/program-detail")}
          >
            Vai al programma <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pw-wizard">
      <div className="pw-progress-track">
        <div
          className="pw-progress-fill"
          style={{ width: `${progressPct}%` }}
        ></div>
      </div>
      <div className="pw-step-count">
        Step {stepIndex + 1} di {STEPS.length}
      </div>
      <div className="pw-card">
        {step === "goal" && (
          <>
            <h2 className="pw-question">Qual è il tuo obiettivo?</h2>
            <div className="pw-grid-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  className={`pw-option ${answers.goal === g.id ? "selected" : ""}`}
                  onClick={() => select("goal", g.id)}
                >
                  <i className={`bi ${g.icon}`}></i>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === "level" && (
          <>
            <h2 className="pw-question">Che livello hai?</h2>
            <div className="pw-grid-3">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  className={`pw-option ${answers.level === l ? "selected" : ""}`}
                  onClick={() => select("level", l)}
                >
                  <span>{l}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === "days" && (
          <>
            <h2 className="pw-question">Quanti giorni puoi allenarti?</h2>
            <div className="pw-grid-5">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  className={`pw-option pw-option-num ${answers.days === n ? "selected" : ""}`}
                  onClick={() => select("days", n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
        {step === "equipment" && (
          <>
            <h2 className="pw-question">
              Che attrezzatura hai a disposizione?
            </h2>
            <p className="pw-hint">Puoi selezionarne più di una</p>
            <div className="pw-grid-2">
              {EQUIPMENT.map((e) => (
                <button
                  key={e}
                  className={`pw-option ${answers.equipment.includes(e) ? "selected" : ""}`}
                  onClick={() => toggleEquipment(e)}
                >
                  <span>{e}</span>
                  {answers.equipment.includes(e) && (
                    <i className="bi bi-check-lg"></i>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
        {step === "style" && (
          <>
            <h2 className="pw-question">
              Che stile di allenamento preferisci?
            </h2>
            <div className="pw-grid-1">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  className={`pw-option pw-option-wide ${answers.style === s.id ? "selected" : ""}`}
                  onClick={() => select("style", s.id)}
                >
                  <div>
                    <span className="pw-option-title">{s.label}</span>
                    <span className="pw-option-desc">{s.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="pw-nav">
        {errorMessage && (
          <p className="pw-error" role="alert">
            {errorMessage}
          </p>
        )}
        <button
          className="pw-btn-outline"
          onClick={back}
          disabled={stepIndex === 0}
        >
          <i className="bi bi-arrow-left"></i> Indietro
        </button>
        <button className="pw-btn-fill" onClick={next} disabled={!canProceed()}>
          {stepIndex === STEPS.length - 1 ? "Genera scheda" : "Avanti"}{" "}
          <i className="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  )
}
