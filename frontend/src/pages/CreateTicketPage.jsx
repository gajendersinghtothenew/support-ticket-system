import { useNavigate } from 'react-router-dom'

import { createTicket } from '../api/tickets'
import TicketForm from '../components/tickets/TicketForm'
import './CreateTicketPage.css'

export default function CreateTicketPage() {
  const navigate = useNavigate()

  async function handleCreate(payload) {
    const ticket = await createTicket(payload)
    navigate(`/tickets/${ticket.id}`, { replace: true })
  }

  return (
    <main className="create-ticket-page">
      <TicketForm onSubmit={handleCreate} />
    </main>
  )
}
