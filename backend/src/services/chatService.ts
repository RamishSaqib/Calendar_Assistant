import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config'
import { NormalizedEvent } from './calendarService'

// Initialize Gemini API client
const genAI = config.llmApiKey ? new GoogleGenerativeAI(config.llmApiKey) : null

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

async function callLlm(
  message: string,
  systemInstruction: string,
  history: ChatMessage[],
): Promise<string> {
  if (!genAI) {
    console.warn('LLM_API_KEY is not set. Returning stub response.')
    return `Stubbed assistant response (LLM_API_KEY missing) for: "${message}"`
  }

  // Convert history to Gemini format
  const geminiHistory = history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  const tryModel = async (modelName: string) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
    })
    const chat = model.startChat({
      history: geminiHistory,
    })
    const result = await chat.sendMessage(message)
    const response = await result.response
    return response.text()
  }

  try {
    // Try the latest available model (Gemini 2.5 Flash)
    return await tryModel('gemini-2.5-flash')
  } catch (error: any) {
    console.warn(
      'Failed to use gemini-2.5-flash, falling back to gemini-flash-latest:',
      error.message,
    )
    try {
      // Fallback to alias
      return await tryModel('gemini-flash-latest')
    } catch (fallbackError: any) {
      console.error('Error calling Gemini API (both models failed):', fallbackError)
      return 'I apologize, but I am having trouble connecting to my brain right now. Please ensure your API key is valid.'
    }
  }
}

function summarizeEventsForPrompt(events: NormalizedEvent[]): string {
  if (!events || events.length === 0) {
    return 'You have no events in the selected time range.'
  }

  const lines = events.map((event) => {
    const attendees =
      event.attendees && event.attendees.length > 0
        ? ` with ${event.attendees.join(', ')}`
        : ''
    // Format date nicely if possible, or keep raw string
    return `- ${event.title}: ${event.start} to ${event.end}${attendees}`
  })

  return `Here are the user's events:\n${lines.join('\n')}`
}

export async function generateAssistantReply(params: {
  message: string
  history: ChatMessage[]
  events: NormalizedEvent[]
}): Promise<string> {
  const eventsSummary = summarizeEventsForPrompt(params.events)

  const systemInstruction = [
    'You are a helpful calendar assistant.',
    'You can see the user’s upcoming and recent events and should reason about their time spent in meetings, focus time, and personal commitments like workouts.',
    'When asked to draft emails, write clear, polite email templates the user can copy and send themselves.',
    'When asked about meeting load, estimate time spent in meetings and suggest concrete strategies to reduce unnecessary meetings and protect focus blocks.',
    'Keep your responses concise and helpful.',
    '',
    eventsSummary,
  ].join('\n')

  return callLlm(params.message, systemInstruction, params.history)
}

