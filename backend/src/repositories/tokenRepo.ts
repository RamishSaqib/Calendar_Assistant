import db from '../db'

export type Token = {
    id: number
    userId: string
    refreshToken: string
    accessToken: string | null
    scope: string | null
    expiryDate: number | null
    createdAt: number
    updatedAt: number
}

export function findTokenByUserId(userId: string): Token | undefined {
    const row = db
        .prepare('SELECT * FROM tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
        .get(userId) as any

    if (!row) return undefined

    return {
        id: row.id,
        userId: row.user_id,
        refreshToken: row.refresh_token,
        accessToken: row.access_token,
        scope: row.scope,
        expiryDate: row.expiry_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export function upsertToken(params: {
    userId: string
    refreshToken: string
    accessToken?: string | undefined
    scope?: string | undefined
    expiryDate?: number | undefined
}): void {
    const now = Math.floor(Date.now() / 1000)

    // Delete existing tokens for this user
    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(params.userId)

    // Insert new token
    db.prepare(
        `INSERT INTO tokens (user_id, refresh_token, access_token, scope, expiry_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
        params.userId,
        params.refreshToken,
        params.accessToken || null,
        params.scope || null,
        params.expiryDate || null,
        now,
        now,
    )
}

export function deleteTokensByUserId(userId: string): void {
    db.prepare('DELETE FROM tokens WHERE user_id = ?').run(userId)
}
