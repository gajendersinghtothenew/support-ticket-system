import { useCallback, useEffect, useState } from 'react'

import { listTickets } from '../api/tickets'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TicketCard from '../components/tickets/TicketCard'
import { getApiErrorMessage } from '../utils/errors'
import './TicketListPage.css'

export default function TicketListPage() {
  const [tickets, setTickets] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTickets = useCallback(async (pageNumber = 1) => {
    setIsLoading(true)
    setError('')

    try {
      const data = await listTickets({ page: pageNumber })
      setTickets(data.results)
      setCount(data.count)
      setHasNext(Boolean(data.next))
      setHasPrevious(Boolean(data.previous))
      setPage(pageNumber)
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError, 'Unable to load tickets.'))
      setTickets([])
      setCount(0)
      setHasNext(false)
      setHasPrevious(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets(page)
  }, [fetchTickets, page])

  if (isLoading) {
    return (
      <main className="ticket-list-page">
        <LoadingSpinner label="Loading tickets..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="ticket-list-page">
        <ErrorMessage message={error} onRetry={() => fetchTickets(page)} />
      </main>
    )
  }

  return (
    <main className="ticket-list-page">
      <header className="ticket-list-page__header">
        <div>
          <h1>Tickets</h1>
          <p>Browse and manage support tickets.</p>
        </div>
      </header>

      {tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          message="Tickets you create or have access to will appear here."
        />
      ) : (
        <>
          <p className="ticket-list-page__count">
            Showing {tickets.length} of {count} tickets
          </p>

          <div className="ticket-list-page__list">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>

          {(hasPrevious || hasNext) && (
            <div className="ticket-list-page__pagination">
              <button
                type="button"
                className="button button--secondary"
                disabled={!hasPrevious}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <p>Page {page}</p>
              <button
                type="button"
                className="button button--secondary"
                disabled={!hasNext}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
