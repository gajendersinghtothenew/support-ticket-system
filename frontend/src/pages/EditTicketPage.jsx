import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getTicket, updateTicket } from '../api/tickets'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TicketForm from '../components/tickets/TicketForm'
import { getApiErrorMessage } from '../utils/errors'
import './EditTicketPage.css'

export default function EditTicketPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTicket = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await getTicket(id)
      setTicket(data)
    } catch (fetchError) {
      setTicket(null)
      setError(getApiErrorMessage(fetchError, 'Unable to load this ticket.'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  async function handleUpdate(payload) {
    const updated = await updateTicket(id, payload)
    navigate(`/tickets/${updated.id}`, { replace: true })
  }

  if (isLoading) {
    return (
      <main className="edit-ticket-page">
        <LoadingSpinner label="Loading ticket..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="edit-ticket-page">
        <div className="edit-ticket-page__toolbar">
          <Link to="/tickets" className="button button--secondary">
            Back to Tickets
          </Link>
        </div>
        <ErrorMessage message={error} onRetry={fetchTicket} />
      </main>
    )
  }

  if (!ticket) {
    return (
      <main className="edit-ticket-page">
        <div className="edit-ticket-page__toolbar">
          <Link to="/tickets" className="button button--secondary">
            Back to Tickets
          </Link>
        </div>
        <EmptyState
          title="Ticket not found"
          message="This ticket may have been removed or you may not have access to it."
        />
      </main>
    )
  }

  return (
    <main className="edit-ticket-page">
      <p className="edit-ticket-page__ticket-number">{ticket.ticket_number}</p>
      <TicketForm
        mode="edit"
        initialValues={ticket}
        cancelTo={`/tickets/${ticket.id}`}
        onSubmit={handleUpdate}
      />
    </main>
  )
}
