import db from '../db'
import { randomUUID } from 'crypto'

export type User = {
    id: string
    googleId: string
    email: string
    name: string | null
    createdAt: number
    updatedAt: number
}

export function findUserByGoogleId(googleId: string): User | undefined {
    const row = db
        .prepare('SELECT * FROM users WHERE google_id = ?')
        .get(googleId) as any

    if (!row) return undefined

    return {
        id: row.id,
        googleId: row.google_id,
        email: row.email,
        name: row.name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export function findUserById(id: string): User | undefined {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any

    if (!row) return undefined

    return {
        id: row.id,
        googleId: row.google_id,
        email: row.email,
        name: row.name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export function createUser(params: {
    googleId: string
    email: string
    name?: string
}): User {
    const id = randomUUID()
    const now = Math.floor(Date.now() / 1000)

    db.prepare(
        `INSERT INTO users (id, google_id, email, name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, params.googleId, params.email, params.name || null, now, now)

    return {
        id,
        googleId: params.googleId,
        email: params.email,
        name: params.name || null,
        createdAt: now,
        updatedAt: now,
    }
}

export function updateUser(
    id: string,
    params: { email?: string; name?: string },
): void {
    const now = Math.floor(Date.now() / 1000)
    const updates: string[] = []
    const values: any[] = []

    if (params.email !== undefined) {
        updates.push('email = ?')
        values.push(params.email)
    }
    if (params.name !== undefined) {
        updates.push('name = ?')
        values.push(params.name)
    }

    if (updates.length === 0) return

    updates.push('updated_at = ?')
    values.push(now)
    values.push(id)

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(
        ...values,
    )
}
