import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import StitchScreenFrame from '../components/stitch-screen-frame'
import registerStitchHtml from '../stitch-html/register-modern-playful.html?raw'

export default function RegisterPage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/profile"

  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  return <StitchScreenFrame html={registerStitchHtml} title="PETT Register - Stitch" fitContent={true} />
}
