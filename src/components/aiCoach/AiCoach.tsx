import { useState } from "react"
import { ProgramWizard, CoachChat } from "./index"
import "./AiCoach.css"

export default function AiCoach() {
  const [tab, setTab] = useState<"wizard" | "chat">("wizard")

  return (
    <div className="ac-page">
      <div className="ac-header">
        <div>
          <h1 className="ac-title">
            <span className="ac-title-highlight">AI</span> Coach
          </h1>
          <p className="ac-sub">
            Genera la tua scheda personalizzata o chiedi consiglio al tuo coach
            virtuale.
          </p>
        </div>

        <div className="ac-tabs">
          <button
            className={`ac-tab ${tab === "wizard" ? "active" : ""}`}
            onClick={() => setTab("wizard")}
          >
            <i className="bi bi-magic"></i> Genera scheda
          </button>
          <button
            className={`ac-tab ${tab === "chat" ? "active" : ""}`}
            onClick={() => setTab("chat")}
          >
            <i className="bi bi-chat-dots"></i> Chat
          </button>
        </div>
      </div>

      <div className="ac-content">
        {tab === "wizard" ? <ProgramWizard /> : <CoachChat />}
      </div>
    </div>
  )
}
