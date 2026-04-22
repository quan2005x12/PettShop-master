import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

/**
 * AuthGuard component for Role-Based Access Control
 * @param {Array} allowedRoles - List of roles that can access this route (e.g. ['admin', 'customer'])
 * @param {boolean} requireAuth - Whether the user must be logged in
 */
export default function AuthGuard({ allowedRoles = [], requireAuth = true }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaee]">
        <div className="text-teal-600 font-bold animate-pulse flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
            <span>Đang xác thực quyền truy cập...</span>
        </div>
      </div>
    )
  }

  // 1. If auth is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. If user is logged in but doesn't have the required role
  if (requireAuth && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 3. Allow access
  return <Outlet />
}
