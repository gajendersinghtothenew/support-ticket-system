import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getTicketStats } from '../api/tickets'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatCard from '../components/dashboard/StatCard'
import StatusBreakdown from '../components/dashboard/StatusBreakdown'
import TicketCard from '../components/tickets/TicketCard'
import { getApiErrorMessage } from '../utils/errors'
import './DashboardPage.css'

function isStaffRole(role) {
  return role === 'agent' || role === 'admin'
}

function CustomerDashboard({ stats }) {
  return (
    <>
      <div className="dashboard-page__stats">
        <StatCard label="Total tickets" value={stats.total} to="/tickets" variant="neutral" />
        <StatCard
          label="Active"
          value={stats.active}
          to="/tickets?status=open"
          variant="info"
        />
        <StatCard
          label="Waiting on you"
          value={stats.needs_attention}
          to="/tickets?status=waiting_on_customer"
          variant="warning"
        />
        <StatCard
          label="Resolved"
          value={stats.by_status.resolved ?? 0}
          to="/tickets?status=resolved"
          variant="success"
        />
      </div>

      <div className="dashboard-page__grid">
        <StatusBreakdown byStatus={stats.by_status} />
        <section className="dashboard-page__panel">
          <h2>Quick actions</h2>
          <div className="dashboard-page__actions">
            <Link to="/tickets/new" className="button button--primary">
              Create ticket
            </Link>
            <Link to="/tickets" className="button button--secondary">
              View all tickets
            </Link>
          </div>
          {stats.needs_attention > 0 ? (
            <p className="dashboard-page__hint">
              You have {stats.needs_attention} ticket
              {stats.needs_attention === 1 ? '' : 's'} waiting for your response.
            </p>
          ) : (
            <p className="dashboard-page__hint">
              No tickets need your attention right now.
            </p>
          )}
        </section>
      </div>
    </>
  )
}

function AgentDashboard({ stats }) {
  return (
    <>
      <div className="dashboard-page__stats">
        <StatCard
          label="Open pipeline"
          value={stats.open_pipeline}
          to="/tickets?status=open"
          variant="info"
        />
        <StatCard
          label="Assigned to me"
          value={stats.assigned_to_me}
          to="/tickets"
          variant="primary"
        />
        <StatCard label="Unassigned" value={stats.unassigned} to="/tickets" variant="warning" />
        <StatCard
          label="Urgent / high"
          value={stats.urgent_open}
          to="/tickets?priority=urgent"
          variant="danger"
        />
      </div>

      <div className="dashboard-page__grid">
        <StatusBreakdown byStatus={stats.by_status} />
        <section className="dashboard-page__panel">
          <h2>Queue overview</h2>
          <dl className="dashboard-page__metrics">
            <div>
              <dt>Total tickets</dt>
              <dd>{stats.total}</dd>
            </div>
            <div>
              <dt>Open</dt>
              <dd>{stats.by_status.open ?? 0}</dd>
            </div>
            <div>
              <dt>In progress</dt>
              <dd>{stats.by_status.in_progress ?? 0}</dd>
            </div>
            <div>
              <dt>Waiting on customer</dt>
              <dd>{stats.by_status.waiting_on_customer ?? 0}</dd>
            </div>
          </dl>
          <div className="dashboard-page__actions">
            <Link to="/tickets" className="button button--primary">
              Browse queue
            </Link>
            <Link to="/tickets/new" className="button button--secondary">
              Create ticket
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getTicketStats()
        if (isMounted) {
          setStats(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load dashboard.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  const staff = isStaffRole(user?.role)
  const subtitle = staff
    ? 'Monitor queue health and your assigned workload.'
    : 'Track your support requests at a glance.'

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back, {user?.username}. {subtitle}
          </p>
        </div>
      </header>

      {isLoading ? (
        <LoadingSpinner label="Loading dashboard..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      ) : stats ? (
        <>
          {staff ? <AgentDashboard stats={stats} /> : <CustomerDashboard stats={stats} />}

          <section className="dashboard-page__recent">
            <div className="dashboard-page__recent-header">
              <h2>Recent tickets</h2>
              <Link to="/tickets">View all</Link>
            </div>

            {stats.recent_tickets?.length ? (
              <div className="dashboard-page__recent-list">
                {stats.recent_tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No tickets yet"
                message={
                  staff
                    ? 'Tickets will appear here as customers submit requests.'
                    : 'Create your first ticket to get started.'
                }
              />
            )}
          </section>
        </>
      ) : null}
    </main>
  )
}
