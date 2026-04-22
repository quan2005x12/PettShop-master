import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import StitchScreenFrame from '../components/stitch-screen-frame'
import loginStitchHtml from '../stitch-html/login-modern-playful.html?raw'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/profile"

  if (!loading && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to={from} replace />
  }

  return <StitchScreenFrame html={loginStitchHtml} title="PETT Login - Stitch" fitContent={true} />
}
