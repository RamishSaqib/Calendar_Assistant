import { Request, Response } from 'express'
import { google } from 'googleapis'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import {
  findUserByGoogleId,
  createUser,
  updateUser,
} from '../repositories/userRepo'
import { upsertToken } from '../repositories/tokenRepo'

const oauth2Client = new google.auth.OAuth2(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri,
)

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'openid',
  'email',
  'profile',
]

export function getAuthUrlHandler(_req: Request, res: Response) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })

  res.json({ url })
}

export async function googleCallbackHandler(req: Request, res: Response) {
  const code = req.query.code
  if (typeof code !== 'string') {
    return res.status(400).send('Missing code')
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' })
    const { data: profile } = await oauth2.userinfo.get()

    const googleId = profile.id ?? ''
    const email = profile.email ?? ''
    const name = profile.name ?? ''

    if (!googleId || !email) {
      return res.status(400).send('Invalid Google profile')
    }

    // Find or create user
    let user = findUserByGoogleId(googleId)
    if (!user) {
      user = createUser({ googleId, email, name })
    } else {
      // Update user info if changed
      updateUser(user.id, { email, name })
    }

    // Store refresh token
    if (tokens.refresh_token) {
      upsertToken({
        userId: user.id,
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token ?? undefined,
        scope: tokens.scope ?? undefined,
        expiryDate: tokens.expiry_date ?? undefined,
      })
    }

    const accessToken = tokens.access_token ?? ''

    const token = jwt.sign({ sub: user.id }, config.jwtSecret, {
      expiresIn: '8h',
    })

    const params = new URLSearchParams({
      token,
      id: user.id,
    })

    if (accessToken) {
      params.set('googleAccessToken', accessToken)
    }

    if (email) params.set('email', email)
    if (name) params.set('name', name)

    const redirectUrl = `${config.clientOrigin}/auth/callback?${params.toString()}`
    res.redirect(302, redirectUrl)
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).send('Failed to complete Google authentication')
  }
}

