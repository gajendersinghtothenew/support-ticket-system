import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../utils/errors'
import './AuthForm.css'

const initialFormState = {
  username: '',
  password: '',
}

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState(initialFormState)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
      })
      navigate('/tickets', { replace: true })
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to log in.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div>
        <h1>Log in</h1>
        <p className="auth-form__subtitle">
          Access your support tickets and account.
        </p>
      </div>

      {error ? <p className="auth-form__error">{error}</p> : null}

      <div className="auth-form__field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>

      <p className="auth-form__footer">
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  )
}
