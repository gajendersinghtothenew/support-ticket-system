import { TICKET_STATUSES, STATUS_BADGE_VARIANTS } from '../../utils/constants'
import './StatusBreakdown.css'

export default function StatusBreakdown({ byStatus }) {
  const entries = Object.entries(TICKET_STATUSES).map(([status, label]) => ({
    status,
    label,
    count: byStatus[status] ?? 0,
    variant: STATUS_BADGE_VARIANTS[status] || 'neutral',
  }))

  const maxCount = Math.max(...entries.map((entry) => entry.count), 1)

  return (
    <section className="status-breakdown" aria-label="Tickets by status">
      <h2>By status</h2>
      <ul className="status-breakdown__list">
        {entries.map(({ status, label, count, variant }) => (
          <li key={status} className="status-breakdown__item">
            <div className="status-breakdown__header">
              <span className={`status-breakdown__label status-breakdown__label--${variant}`}>
                {label}
              </span>
              <span className="status-breakdown__count">{count}</span>
            </div>
            <div className="status-breakdown__bar-track">
              <div
                className={`status-breakdown__bar status-breakdown__bar--${variant}`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
