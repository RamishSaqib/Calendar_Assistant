import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { config } from '../config'

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnectGoogle = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${config.backendUrl}/auth/google/url`)
      if (!res.ok) {
        throw new Error('Failed to start Google authentication')
      }
      const data = (await res.json()) as { url: string }
      window.location.href = data.url
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unexpected error starting auth flow',
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Calendar Assistant</h1>
      </header>
      <main className="app-main">
        <section className="hero">
          <h2>Your Intelligent Calendar Assistant</h2>
          <p>
            Connect your Google Calendar, see your schedule at a glance, and
            chat with an assistant that helps you protect your focus time,
            schedule meetings, and reduce calendar overload.
          </p>
          <button
            className="primary-button"
            onClick={handleConnectGoogle}
            disabled={isLoading}
          >
            {isLoading
              ? 'Connecting to Google...'
              : isAuthenticated
                ? 'Re-connect Google Calendar'
                : 'Connect Google Calendar'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </section>
      </main>
    </div>
  )
}

