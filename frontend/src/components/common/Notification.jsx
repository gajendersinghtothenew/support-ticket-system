import { useEffect } from 'react'

import './Notification.css'

export default function Notification({ type = 'success', message, onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      onClose?.()
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [message, onClose])

  if (!message) {
    return null
  }

  return (
    <div className={`notification notification--${type}`} role="status">
      <p>{message}</p>
      {onClose ? (
        <button
          type="button"
          className="notification__close"
          aria-label="Dismiss notification"
          onClick={onClose}
        >
          ×
        </button>
      ) : null}
    </div>
  )
}
