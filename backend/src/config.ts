import dotenv from 'dotenv'

dotenv.config()

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').replace(
    /\/$/,
    '',
  ),
  jwtSecret: requireEnv('JWT_SECRET'),
  googleClientId: requireEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ??
    'http://localhost:4000/auth/google/callback',
  llmApiKey: process.env.LLM_API_KEY,
  dbPath: process.env.DB_PATH,
}

