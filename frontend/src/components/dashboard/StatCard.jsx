import { Link } from 'react-router-dom'

import './StatCard.css'

export default function StatCard({ label, value, to, variant = 'neutral' }) {
  const className = `stat-card stat-card--${variant}`

  if (to) {
    return (
      <Link to={to} className={className}>
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </Link>
    )
  }

  return (
    <div className={className}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  )
}
