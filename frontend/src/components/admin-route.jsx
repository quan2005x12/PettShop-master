import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaee]">
        <div className="text-teal-600 font-bold animate-pulse">Đang kiểm tra quyền truy cập...</div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
