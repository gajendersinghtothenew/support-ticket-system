import './Badge.css'

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="state-message" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}
