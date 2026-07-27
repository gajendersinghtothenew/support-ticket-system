import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from '../components/layout/AppLayout'
import CreateTicketPage from '../pages/CreateTicketPage'
import DashboardPage from '../pages/DashboardPage'
import EditTicketPage from '../pages/EditTicketPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import TicketDetailPage from '../pages/TicketDetailPage'
import TicketListPage from '../pages/TicketListPage'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'

function HomePlaceholder() {
  return (
    <main>
      <h1>Support Ticket System</h1>
      <p>Log in to manage your support tickets.</p>
    </main>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/new" element={<CreateTicketPage />} />
          <Route path="/tickets/:id/edit" element={<EditTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
