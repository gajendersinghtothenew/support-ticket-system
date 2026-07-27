import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getTicket } from '../api/tickets'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TicketMeta from '../components/tickets/TicketMeta'
import { getApiErrorMessage } from '../utils/errors'
import './TicketDetailPage.css'

export default function TicketDetailPage() {
  const { id } = useParams()
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

  if (isLoading) {
    return (
      <main className="ticket-detail-page">
        <LoadingSpinner label="Loading ticket..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="ticket-detail-page">
        <div className="ticket-detail-page__toolbar">
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
      <main className="ticket-detail-page">
        <div className="ticket-detail-page__toolbar">
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
    <main className="ticket-detail-page">
      <div className="ticket-detail-page__toolbar">
        <Link to="/tickets" className="button button--secondary">
          Back to Tickets
        </Link>
      </div>

      <article className="ticket-detail-page__card">
        <header className="ticket-detail-page__header">
          <p className="ticket-detail-page__number">{ticket.ticket_number}</p>
          <h1>{ticket.title}</h1>
        </header>

        <TicketMeta ticket={ticket} />

        <section className="ticket-detail-page__description" aria-labelledby="description-heading">
          <h2 id="description-heading">Description</h2>
          <p>{ticket.description}</p>
        </section>
      </article>
    </main>
  )
}
