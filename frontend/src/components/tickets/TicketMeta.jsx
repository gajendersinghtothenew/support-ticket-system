import { TICKET_CATEGORIES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import TicketPriorityBadge from './TicketPriorityBadge'
import TicketStatusBadge from './TicketStatusBadge'
import './TicketMeta.css'

export default function TicketMeta({ ticket }) {
  const categoryLabel = TICKET_CATEGORIES[ticket.category] || ticket.category || '—'
  const createdBy = ticket.created_by?.username || '—'
  const assignedTo = ticket.assigned_to?.username || 'Unassigned'

  return (
    <section className="ticket-meta" aria-label="Ticket details">
      <div className="ticket-meta__badges">
        <TicketStatusBadge status={ticket.status} />
        <TicketPriorityBadge priority={ticket.priority} />
      </div>

      <dl className="ticket-meta__grid">
        <div>
          <dt>Ticket ID</dt>
          <dd>{ticket.ticket_number}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{categoryLabel}</dd>
        </div>
        <div>
          <dt>Created by</dt>
          <dd>{createdBy}</dd>
        </div>
        <div>
          <dt>Assigned to</dt>
          <dd>{assignedTo}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(ticket.created_at)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDate(ticket.updated_at)}</dd>
        </div>
      </dl>
    </section>
  )
}
