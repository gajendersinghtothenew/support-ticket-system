import {
  PRIORITY_BADGE_VARIANTS,
  TICKET_PRIORITIES,
} from '../../utils/constants'
import '../common/Badge.css'

export default function TicketPriorityBadge({ priority }) {
  const label = TICKET_PRIORITIES[priority] || priority
  const variant = PRIORITY_BADGE_VARIANTS[priority] || 'neutral'

  return <span className={`badge badge--${variant}`}>{label}</span>
}
