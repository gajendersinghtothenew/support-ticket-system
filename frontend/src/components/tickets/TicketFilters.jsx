import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '../../utils/constants'
import './TicketFilters.css'

const EMPTY_FILTERS = {
  search: '',
  status: '',
  priority: '',
  category: '',
}

export { EMPTY_FILTERS }

export function hasActiveFilters(filters) {
  return Object.values(filters).some((value) => value !== '')
}

export default function TicketFilters({ filters, onChange, onClear }) {
  function handleFieldChange(event) {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <section className="ticket-filters" aria-label="Filter tickets">
      <div className="ticket-filters__search">
        <label htmlFor="ticket-search">Search</label>
        <input
          id="ticket-search"
          name="search"
          type="search"
          placeholder="Search by title or description..."
          value={filters.search}
          onChange={handleFieldChange}
        />
      </div>

      <div className="ticket-filters__grid">
        <div className="ticket-filters__field">
          <label htmlFor="ticket-status">Status</label>
          <select
            id="ticket-status"
            name="status"
            value={filters.status}
            onChange={handleFieldChange}
          >
            <option value="">All statuses</option>
            {Object.entries(TICKET_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="ticket-filters__field">
          <label htmlFor="ticket-priority">Priority</label>
          <select
            id="ticket-priority"
            name="priority"
            value={filters.priority}
            onChange={handleFieldChange}
          >
            <option value="">All priorities</option>
            {Object.entries(TICKET_PRIORITIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="ticket-filters__field">
          <label htmlFor="ticket-category">Category</label>
          <select
            id="ticket-category"
            name="category"
            value={filters.category}
            onChange={handleFieldChange}
          >
            <option value="">All categories</option>
            {Object.entries(TICKET_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters(filters) ? (
        <button
          type="button"
          className="button button--secondary ticket-filters__clear"
          onClick={onClear}
        >
          Clear filters
        </button>
      ) : null}
    </section>
  )
}
