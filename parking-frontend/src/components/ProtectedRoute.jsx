 
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ roles = [] }) {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (roles.length && !roles.includes(role)) return <Navigate to="/" replace />
  return <Outlet />
}
