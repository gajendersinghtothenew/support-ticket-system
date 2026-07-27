import { Link } from 'react-router-dom'

import { TICKET_CATEGORIES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import TicketPriorityBadge from './TicketPriorityBadge'
import TicketStatusBadge from './TicketStatusBadge'
import './TicketCard.css'

export default function TicketCard({ ticket }) {
  const categoryLabel = TICKET_CATEGORIES[ticket.category] || ticket.category
  const assignee = ticket.assigned_to?.username || 'Unassigned'

  return (
    <article className="ticket-card">
      <div className="ticket-card__header">
        <div>
          <p className="ticket-card__number">{ticket.ticket_number}</p>
          <h2 className="ticket-card__title">
            <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
          </h2>
        </div>
        <div className="ticket-card__badges">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <dl className="ticket-card__meta">
        <div>
          <dt>Category</dt>
          <dd>{categoryLabel}</dd>
        </div>
        <div>
          <dt>Created by</dt>
          <dd>{ticket.created_by?.username}</dd>
        </div>
        <div>
          <dt>Assigned to</dt>
          <dd>{assignee}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(ticket.created_at)}</dd>
        </div>
      </dl>
    </article>
  )
}
