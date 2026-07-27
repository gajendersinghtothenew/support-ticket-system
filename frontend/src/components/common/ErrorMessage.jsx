export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-message state-message--error" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}
