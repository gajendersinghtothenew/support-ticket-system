import { useState } from 'react'

import {
  getAllowedStatusTransitions,
  TICKET_STATUSES,
} from '../../utils/constants'
import TicketStatusBadge from './TicketStatusBadge'
import './TicketStatusActions.css'

export default function TicketStatusActions({
  ticket,
  userRole,
  onStatusChange,
}) {
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [localError, setLocalError] = useState('')

  const allowedStatuses = getAllowedStatusTransitions(ticket.status, userRole)

  if (allowedStatuses.length === 0) {
    return (
      <section className="ticket-status-actions" aria-label="Ticket status">
        <div className="ticket-status-actions__current">
          <h2>Status</h2>
          <TicketStatusBadge status={ticket.status} />
        </div>
        <p className="ticket-status-actions__hint">
          No status changes are available for your role on this ticket.
        </p>
      </section>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')

    if (!selectedStatus) {
      setLocalError('Please select a new status.')
      return
    }

    setIsUpdating(true)
    try {
      await onStatusChange(selectedStatus)
      setSelectedStatus('')
    } catch (error) {
      setLocalError(error?.message || 'Unable to update status.')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleQuickAction(status) {
    setLocalError('')
    setIsUpdating(true)
    try {
      await onStatusChange(status)
      setSelectedStatus('')
    } catch (error) {
      setLocalError(error?.message || 'Unable to update status.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className="ticket-status-actions" aria-label="Update ticket status">
      <div className="ticket-status-actions__current">
        <h2>Status</h2>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="ticket-status-actions__quick">
        <p className="ticket-status-actions__label">Quick actions</p>
        <div className="ticket-status-actions__buttons">
          {allowedStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className="button button--secondary"
              disabled={isUpdating}
              onClick={() => handleQuickAction(status)}
            >
              {TICKET_STATUSES[status] || status}
            </button>
          ))}
        </div>
      </div>

      <form className="ticket-status-actions__form" onSubmit={handleSubmit}>
        <label htmlFor="status-select">Or choose a status</label>
        <div className="ticket-status-actions__row">
          <select
            id="status-select"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            disabled={isUpdating}
          >
            <option value="">Select status…</option>
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {TICKET_STATUSES[status] || status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="button button--primary"
            disabled={isUpdating || !selectedStatus}
          >
            {isUpdating ? 'Updating...' : 'Update status'}
          </button>
        </div>
      </form>

      {localError ? (
        <p className="ticket-status-actions__error">{localError}</p>
      ) : null}
    </section>
  )
}
