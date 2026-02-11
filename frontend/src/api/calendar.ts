import { getAuthToken } from './shared'
import { config } from '../config'

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  attendees?: string[]
}

const BASE_URL = config.backendUrl

export async function getEvents(params: {
  start: string
  end: string
}): Promise<CalendarEvent[]> {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const url = new URL('/api/calendar/events', BASE_URL)
  url.searchParams.set('start', params.start)
  url.searchParams.set('end', params.end)

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch calendar events')
  }

  const data = (await res.json()) as { events: CalendarEvent[] }
  return data.events
}
