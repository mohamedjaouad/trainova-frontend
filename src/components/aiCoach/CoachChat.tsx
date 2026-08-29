import { useEffect, useRef, useState } from "react"
import apiClient from "../../api/api"
import "./CoachChat.css"

interface Message {
  role: "user" | "ai"
  text: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "ai",
    text: "Ciao! Sono Trainova Coach. Chiedimi consigli su allenamento, tecnica, recupero o sul tuo programma.",
  },
]

export default function CoachChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, sending])

  async function send() {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: Message = { role: "user", text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)
    try {
      const response = await apiClient.post("/ai-coach/chat", { message: text })
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: response.data.message,
        },
      ])
    } catch (error) {
      console.error("Errore nella chat AI", error)
      setMessages((prev) => [...prev, { role: "ai", text: "Non riesco a rispondere in questo momento. Verifica che il backend sia avviato e riprova." }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="cc-wrap">
      <div className="cc-log" ref={logRef}>
        {messages.map((m, i) => (
          <div key={i} className={`cc-row ${m.role}`}>
            <div className="cc-avatar">
              {m.role === "ai" ? (
                <i className="bi bi-cpu"></i>
              ) : (
                <i className="bi bi-person"></i>
              )}
            </div>
            <div className="cc-bubble">{m.text}</div>
          </div>
        ))}
        {sending && (
          <div className="cc-row ai">
            <div className="cc-avatar"><i className="bi bi-cpu"></i></div>
            <div className="cc-bubble">Sto pensando...</div>
          </div>
        )}
      </div>

      <div className="cc-input-row">
        <input
          type="text"
          placeholder="Chiedi qualsiasi cosa al tuo AI coach..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={sending}
        />

        <button className="cc-send" onClick={send} disabled={sending} aria-label="Invia messaggio">
          <i className="bi bi-send"></i>
        </button>
      </div>
    </div>
  )
}
