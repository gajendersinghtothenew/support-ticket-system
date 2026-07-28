import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { listTickets } from '../api/tickets'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import TicketCard from '../components/tickets/TicketCard'
import TicketFilters, {
  EMPTY_FILTERS,
  hasActiveFilters,
} from '../components/tickets/TicketFilters'
import { getApiErrorMessage } from '../utils/errors'
import './TicketListPage.css'

function filtersFromSearchParams(searchParams) {
  return {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
  }
}

export default function TicketListPage() {
  const [searchParams] = useSearchParams()
  const [tickets, setTickets] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [filters, setFilters] = useState(() => filtersFromSearchParams(searchParams))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTickets = useCallback(async (pageNumber, activeFilters) => {
    setIsLoading(true)
    setError('')

    try {
      const data = await listTickets({
        page: pageNumber,
        ...activeFilters,
      })
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
    const timer = window.setTimeout(() => {
      fetchTickets(1, filters)
    }, filters.search ? 300 : 0)

    return () => window.clearTimeout(timer)
  }, [filters, fetchTickets])

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters)
    setPage(1)
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  function handlePageChange(nextPage) {
    fetchTickets(nextPage, filters)
  }

  return (
    <main className="ticket-list-page">
      <header className="ticket-list-page__header">
        <div>
          <h1>Tickets</h1>
          <p>Browse and manage support tickets.</p>
        </div>
      </header>

      <TicketFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {isLoading ? (
        <LoadingSpinner label="Loading tickets..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchTickets(page, filters)} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title={hasActiveFilters(filters) ? 'No matching tickets' : 'No tickets yet'}
          message={
            hasActiveFilters(filters)
              ? 'Try adjusting your search or filters.'
              : 'Tickets you create or have access to will appear here.'
          }
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
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <p>Page {page}</p>
              <button
                type="button"
                className="button button--secondary"
                disabled={!hasNext}
                onClick={() => handlePageChange(page + 1)}
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
