import { STORAGE_KEY } from '../context/storageKey'

type StoredAuth = {
  token?: string
  googleAccessToken?: string | null
}

function getStoredAuth(): StoredAuth | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as StoredAuth
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  const data = getStoredAuth()
  return data?.token ?? null
}

export function getGoogleAccessToken(): string | null {
  const data = getStoredAuth()
  return data?.googleAccessToken ?? null
}

