import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ChatPanel } from '../components/ChatPanel'
import { getEvents, type CalendarEvent } from '../api/calendar'

type DateRange = 'today' | 'this_week' | 'next_week'

function getRange(range: DateRange): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  switch (range) {
    case 'today': {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    case 'this_week': {
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day // Monday as first day
      start.setDate(now.getDate() + diff)
      start.setHours(0, 0, 0, 0)
      end.setTime(start.getTime())
      end.setDate(start.getDate() + 7)
      return { start, end }
    }
    case 'next_week': {
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day
      start.setDate(now.getDate() + diff + 7)
      start.setHours(0, 0, 0, 0)
      end.setTime(start.getTime())
      end.setDate(start.getDate() + 7)
      return { start, end }
    }
  }
}

function formatRangeLabel(range: DateRange) {
  switch (range) {
    case 'today':
      return 'Today'
    case 'this_week':
      return 'This week'
    case 'next_week':
      return 'Next week'
  }
}

function formatTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const sameDay = start.toDateString() === end.toDateString()

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  const dayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  if (sameDay) {
    return `${dayFormatter.format(start)}, ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`
  }

  return `${dayFormatter.format(start)} ${timeFormatter.format(start)} → ${dayFormatter.format(end)} ${timeFormatter.format(end)}`
}

export function CalendarPage() {
  const { user } = useAuth()
  const [range, setRange] = useState<DateRange>('this_week')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const { start, end } = getRange(range)
    const fetchEvents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getEvents({
          start: start.toISOString(),
          end: end.toISOString(),
        })
        setEvents(data)
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Failed to load calendar events',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void fetchEvents()
  }, [range])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Calendar Assistant</h1>
      </header>
      <main className="app-main">
        <div className="calendar-layout">
          <section className="calendar-panel">
            <div className="calendar-header">
              <div>
                <h2>Your schedule</h2>
                <p className="calendar-event-meta">
                  {user?.email ?? 'Connected Google account'}
                </p>
              </div>
              <div className="calendar-range-buttons">
                {(['today', 'this_week', 'next_week'] as DateRange[]).map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      className="secondary-button"
                      onClick={() => setRange(value)}
                    >
                      {formatRangeLabel(value)}
                    </button>
                  ),
                )}
              </div>
            </div>

            {isLoading && <p>Loading events...</p>}
            {error && <p className="error-text">{error}</p>}

            {!isLoading && !error && (
              <ul className="calendar-events-list">
                {events.length === 0 && (
                  <li className="calendar-event-meta">
                    No events in this range.
                  </li>
                )}
                {events.map((event) => (
                  <li key={event.id} className="calendar-event">
                    <div className="calendar-event-title">{event.title}</div>
                    <div className="calendar-event-meta">
                      {formatTimeRange(event.start, event.end)}
                      {event.attendees && event.attendees.length > 0 && (
                        <> • {event.attendees.join(', ')}</>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="chat-panel">
            <ChatPanel />
          </section>
        </div>
      </main>
    </div>
  )
}

