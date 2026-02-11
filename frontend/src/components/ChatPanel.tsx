import { type FormEvent, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { sendMessage } from '../api/chat'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

const QUICK_PROMPTS = [
  'How much of my time am I spending in meetings this week?',
  'Help me block my mornings for workouts and move meetings later.',
  'Suggest ways to reduce recurring meetings on my calendar.',
]

export function ChatPanel() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  const hasMessages = messages.length > 0

  const greeting = useMemo(
    () =>
      `Hi${user?.name ? ` ${user.name}` : ''}, I can help you understand and reshape your schedule. Ask me about meeting load, focus time, or drafting emails to propose new times.`,
    [user?.name],
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    const placeholder: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Thinking about your calendar...',
    }
    setMessages((prev) => [...prev, placeholder])

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

      const reply = await sendMessage({
        message: trimmed,
        history,
      })
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? { ...m, content: reply }
            : m,
        ),
      )
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? {
                ...m,
                content:
                  e instanceof Error
                    ? `Something went wrong: ${e.message}`
                    : 'Something went wrong talking to your assistant.',
              }
            : m,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="chat-panel">
      <div className="chat-meta">
        {hasMessages ? 'Calendar-aware assistant' : greeting}
      </div>

      {!hasMessages && (
        <div className="chat-quick-prompts">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="chat-quick-prompt"
              onClick={() => handleQuickPrompt(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.role}`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="chat-input-row">
          <textarea
            className="chat-input"
            placeholder="Ask about your meetings, focus time, or email drafts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="primary-button"
            disabled={isSending || !input.trim()}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}

