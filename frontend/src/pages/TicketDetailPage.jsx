import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { createComment, listComments } from '../api/comments'
import { getTicket, updateTicketStatus } from '../api/tickets'
import CommentForm from '../components/comments/CommentForm'
import CommentList from '../components/comments/CommentList'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Notification from '../components/common/Notification'
import TicketMeta from '../components/tickets/TicketMeta'
import TicketStatusActions from '../components/tickets/TicketStatusActions'
import { useAuth } from '../context/AuthContext'
import { TICKET_STATUSES } from '../utils/constants'
import { getApiErrorMessage } from '../utils/errors'
import './TicketDetailPage.css'

export default function TicketDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCommentsLoading, setIsCommentsLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentsError, setCommentsError] = useState('')
  const [notification, setNotification] = useState(null)

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

  const fetchComments = useCallback(async () => {
    setIsCommentsLoading(true)
    setCommentsError('')

    try {
      const data = await listComments(id)
      setComments(data.results || [])
    } catch (fetchError) {
      setComments([])
      setCommentsError(getApiErrorMessage(fetchError, 'Unable to load comments.'))
    } finally {
      setIsCommentsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function handleCreateComment({ body, is_internal }) {
    const created = await createComment({
      ticket: Number(id),
      body,
      is_internal,
    })
    setComments((current) => [...current, created])
  }

  async function handleStatusChange(newStatus) {
    setNotification(null)
    try {
      const updatedTicket = await updateTicketStatus(id, newStatus)
      setTicket(updatedTicket)
      setNotification({
        type: 'success',
        message: `Status updated to ${TICKET_STATUSES[newStatus] || newStatus}.`,
      })
    } catch (updateError) {
      const message = getApiErrorMessage(updateError, 'Unable to update status.')
      setNotification({
        type: 'error',
        message,
      })
      throw new Error(message)
    }
  }

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
      {notification ? (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      ) : null}

      <div className="ticket-detail-page__toolbar">
        <Link to="/tickets" className="button button--secondary">
          Back to Tickets
        </Link>
        <Link to={`/tickets/${ticket.id}/edit`} className="button button--primary">
          Edit Ticket
        </Link>
      </div>

      <article className="ticket-detail-page__card">
        <header className="ticket-detail-page__header">
          <p className="ticket-detail-page__number">{ticket.ticket_number}</p>
          <h1>{ticket.title}</h1>
        </header>

        <TicketMeta ticket={ticket} />

        <TicketStatusActions
          ticket={ticket}
          userRole={user?.role}
          onStatusChange={handleStatusChange}
        />

        <section className="ticket-detail-page__description" aria-labelledby="description-heading">
          <h2 id="description-heading">Description</h2>
          <p>{ticket.description}</p>
        </section>
      </article>

      <section className="ticket-detail-page__comments" aria-labelledby="comments-heading">
        <div className="ticket-detail-page__comments-header">
          <h2 id="comments-heading">Comments</h2>
          {!isCommentsLoading && !commentsError ? (
            <span className="ticket-detail-page__comments-count">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          ) : null}
        </div>

        {isCommentsLoading ? (
          <LoadingSpinner label="Loading comments..." />
        ) : commentsError ? (
          <ErrorMessage message={commentsError} onRetry={fetchComments} />
        ) : (
          <CommentList comments={comments} />
        )}

        <CommentForm onSubmit={handleCreateComment} />
      </section>
    </main>
  )
}
