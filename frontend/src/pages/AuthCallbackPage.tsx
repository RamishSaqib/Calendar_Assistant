import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const email = params.get('email') ?? undefined
    const name = params.get('name') ?? undefined
    const id = params.get('id') ?? ''
    const googleAccessToken = params.get('googleAccessToken')

    if (!token || !id) {
      navigate('/', { replace: true })
      return
    }

    login(token, { id, email: email ?? 'unknown@example.com', name }, googleAccessToken)
    navigate('/calendar', { replace: true })
  }, [location.search, login, navigate])

  return (
    <div className="app-shell">
      <main className="app-main">
        <p>Finishing sign-in with Google...</p>
      </main>
    </div>
  )
}

