import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { STORAGE_KEY } from './storageKey'

type User = {
  id: string
  email: string
  name?: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  googleAccessToken: string | null
  isAuthenticated: boolean
  login: (token: string, user: User, googleAccessToken: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          user: User
          token: string
          googleAccessToken?: string | null
        }
        setUser(parsed.user)
        setToken(parsed.token)
        setGoogleAccessToken(parsed.googleAccessToken ?? null)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const login = useCallback(
    (newToken: string, newUser: User, newGoogleAccessToken: string | null) => {
      setUser(newUser)
      setToken(newToken)
      setGoogleAccessToken(newGoogleAccessToken)
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: newUser,
          token: newToken,
          googleAccessToken: newGoogleAccessToken,
        }),
      )
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setGoogleAccessToken(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      googleAccessToken,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token, googleAccessToken, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

