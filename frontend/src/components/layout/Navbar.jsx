import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const ROLE_LABELS = {
  customer: 'Customer',
  agent: 'Agent',
  admin: 'Admin',
}

function getInitials(username = '') {
  return username.slice(0, 2).toUpperCase() || '?'
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleLogout() {
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  function closeMenus() {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'User'

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/tickets" className="navbar__brand" onClick={closeMenus}>
          <span className="navbar__logo" aria-hidden="true">
            ST
          </span>
          <span className="navbar__title">Support Tickets</span>
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`navbar__links ${isMenuOpen ? 'navbar__links--open' : ''}`}
          aria-label="Main"
        >
          <NavLink to="/dashboard" onClick={closeMenus}>
            Dashboard
          </NavLink>
          <NavLink to="/tickets" end onClick={closeMenus}>
            Tickets
          </NavLink>
          <NavLink to="/tickets/new" onClick={closeMenus}>
            Create Ticket
          </NavLink>
        </nav>

        <div className="navbar__profile" ref={profileRef}>
          <button
            type="button"
            className="navbar__profile-trigger"
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen((open) => !open)}
          >
            <span className="navbar__avatar" aria-hidden="true">
              {getInitials(user?.username)}
            </span>
            <span className="navbar__username">{user?.username}</span>
            <span className="navbar__caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {isProfileOpen ? (
            <div className="navbar__dropdown" role="menu">
              <div className="navbar__dropdown-header">
                <p className="navbar__dropdown-label">Logged in as</p>
                <p className="navbar__dropdown-name">{user?.username}</p>
                <p className="navbar__dropdown-email">{user?.email || 'No email'}</p>
                <span className="navbar__role">{roleLabel}</span>
              </div>
              <button
                type="button"
                className="navbar__logout"
                role="menuitem"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
