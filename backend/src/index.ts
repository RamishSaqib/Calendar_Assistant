import cors from 'cors'
import express from 'express'
import { config } from './config'
import { getAuthUrlHandler, googleCallbackHandler } from './auth/google'
import { authMiddleware, type AuthenticatedRequest } from './middleware/auth'
import { listEvents } from './services/calendarService'
import { generateAssistantReply } from './services/chatService'

const app = express()

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: false,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/auth/google/url', getAuthUrlHandler)
app.get('/auth/google/callback', googleCallbackHandler)

app.get(
  '/api/calendar/events',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const start = req.query.start
    const end = req.query.end

    if (typeof start !== 'string' || typeof end !== 'string') {
      return res.status(400).json({ error: 'Missing start or end' })
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const events = await listEvents({
        userId: req.userId,
        start,
        end,
      })
      res.json({ events })
    } catch (error: any) {
      console.error('Failed to fetch calendar events:', error)
      res.status(500).json({ error: error.message || 'Failed to fetch calendar events' })
    }
  },
)

app.post(
  '/api/chat',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { message, history } = req.body as {
      message?: string
      history?: { role: 'user' | 'assistant'; content: string }[]
    }
    if (!message) {
      return res.status(400).json({ error: 'Missing message' })
    }

    let events: any[] = []

    if (req.userId) {
      try {
        const now = new Date()
        const start = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString()
        const end = new Date(
          now.getTime() + 14 * 24 * 60 * 60 * 1000,
        ).toISOString()

        events = await listEvents({
          userId: req.userId,
          start,
          end,
        })
      } catch (err) {
        console.error('Failed to fetch calendar context for chat:', err)
        // Proceed with empty events so chat still works even if calendar fails
      }
    }

    const reply = await generateAssistantReply({
      message,
      history: history ?? [],
      events,
    })

    res.json({ reply })
  },
)

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${config.port}`)
})

