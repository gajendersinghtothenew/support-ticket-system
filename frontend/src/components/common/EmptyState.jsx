export default function EmptyState({
  title = 'No tickets found',
  message = 'There are no tickets to display yet.',
}) {
  return (
    <div className="state-message state-message--empty">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  )
}
