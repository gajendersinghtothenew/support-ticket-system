import {
  STATUS_BADGE_VARIANTS,
  TICKET_STATUSES,
} from '../../utils/constants'
import '../common/Badge.css'

export default function TicketStatusBadge({ status }) {
  const label = TICKET_STATUSES[status] || status
  const variant = STATUS_BADGE_VARIANTS[status] || 'neutral'

  return <span className={`badge badge--${variant}`}>{label}</span>
}
