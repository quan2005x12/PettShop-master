import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function PrivateRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaee]">
        <div className="text-teal-600 font-bold animate-pulse">Đang xác thực...</div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login but save the current location so we can go back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
