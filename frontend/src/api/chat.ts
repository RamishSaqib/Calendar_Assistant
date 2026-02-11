import { getAuthToken } from './shared'
import { config } from '../config'

const BASE_URL = config.backendUrl

export async function sendMessage(params: {
  message: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}): Promise<string> {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: params.message,
      history: params.history ?? [],
    }),
  })

  if (!res.ok) {
    throw new Error('Failed to send message to assistant')
  }

  const data = (await res.json()) as { reply: string }
  return data.reply
}
