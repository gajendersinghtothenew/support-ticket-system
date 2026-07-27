import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (isAuthenticated) {
    return <Navigate to="/tickets" replace />
  }

  return <Outlet />
}
