import { google } from 'googleapis'
import { config } from '../config'
import { findTokenByUserId } from '../repositories/tokenRepo'

export type NormalizedEvent = {
  id: string
  title: string
  start: string
  end: string
  attendees: string[]
}

const oauth2Client = new google.auth.OAuth2(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri,
)

export async function listEvents(params: {
  userId: string
  start: string
  end: string
}): Promise<NormalizedEvent[]> {
  // Get stored refresh token
  const tokenRecord = findTokenByUserId(params.userId)
  if (!tokenRecord) {
    throw new Error('No Google token found for user. Please re-authenticate.')
  }

  // Set credentials with refresh token
  oauth2Client.setCredentials({
    refresh_token: tokenRecord.refreshToken,
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const result = await calendar.events.list({
    calendarId: 'primary',
    timeMin: params.start,
    timeMax: params.end,
    singleEvents: true,
    orderBy: 'startTime',
  })

  const items = result.data.items ?? []

  return items
    .filter((event) => event.id && event.summary && event.start && event.end)
    .map((event) => ({
      id: event.id!,
      title: event.summary!,
      start: event.start?.dateTime ?? event.start?.date ?? '',
      end: event.end?.dateTime ?? event.end?.date ?? '',
      attendees:
        event.attendees
          ?.map((a) => a.email)
          .filter((email): email is string => Boolean(email)) ?? [],
    }))
}
