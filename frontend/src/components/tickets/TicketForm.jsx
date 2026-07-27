import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../utils/constants'
import { getApiErrorMessage, getApiFieldErrors } from '../../utils/errors'
import './TicketForm.css'

const INITIAL_FORM = {
  title: '',
  description: '',
  category: 'it_support',
  priority: 'medium',
}

function validateForm(formData) {
  const errors = {}
  const title = formData.title.trim()
  const description = formData.description.trim()

  if (!title) {
    errors.title = 'Title cannot be blank.'
  } else if (title.length < 5) {
    errors.title = 'Title must be at least 5 characters long.'
  }

  if (!description) {
    errors.description = 'Description cannot be blank.'
  } else if (description.length < 10) {
    errors.description = 'Description must be at least 10 characters long.'
  }

  if (!TICKET_CATEGORIES[formData.category]) {
    errors.category = 'Please select a valid category.'
  }

  if (!TICKET_PRIORITIES[formData.priority]) {
    errors.priority = 'Please select a valid priority.'
  }

  return errors
}

function buildFormState(initialValues) {
  if (!initialValues) {
    return INITIAL_FORM
  }

  return {
    title: initialValues.title || '',
    description: initialValues.description || '',
    category: initialValues.category || 'it_support',
    priority: initialValues.priority || 'medium',
  }
}

export default function TicketForm({
  mode = 'create',
  initialValues = null,
  cancelTo = '/tickets',
  onSubmit,
}) {
  const isEditMode = mode === 'edit'
  const [formData, setFormData] = useState(() => buildFormState(initialValues))
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialValues) {
      setFormData(buildFormState(initialValues))
    }
  }, [initialValues])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => {
      if (!current[name]) {
        return current
      }
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const clientErrors = validateForm(formData)
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      })
    } catch (submitError) {
      const apiFieldErrors = getApiFieldErrors(submitError)
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors)
      }
      setFormError(
        getApiErrorMessage(
          submitError,
          isEditMode ? 'Unable to update ticket.' : 'Unable to create ticket.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit} noValidate>
      <div className="ticket-form__header">
        <h1>{isEditMode ? 'Edit Ticket' : 'Create Ticket'}</h1>
        <p>
          {isEditMode
            ? 'Update the ticket details below.'
            : 'Describe your issue and our support team will follow up.'}
        </p>
      </div>

      {formError ? <p className="ticket-form__error">{formError}</p> : null}

      <div className="ticket-form__field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          required
          value={formData.title}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.title)}
        />
        {fieldErrors.title ? (
          <p className="ticket-form__field-error">{fieldErrors.title}</p>
        ) : (
          <p className="ticket-form__hint">At least 5 characters.</p>
        )}
      </div>

      <div className="ticket-form__field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.description)}
        />
        {fieldErrors.description ? (
          <p className="ticket-form__field-error">{fieldErrors.description}</p>
        ) : (
          <p className="ticket-form__hint">At least 10 characters.</p>
        )}
      </div>

      <div className="ticket-form__row">
        <div className="ticket-form__field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.category)}
          >
            {Object.entries(TICKET_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {fieldErrors.category ? (
            <p className="ticket-form__field-error">{fieldErrors.category}</p>
          ) : null}
        </div>

        <div className="ticket-form__field">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.priority)}
          >
            {Object.entries(TICKET_PRIORITIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {fieldErrors.priority ? (
            <p className="ticket-form__field-error">{fieldErrors.priority}</p>
          ) : null}
        </div>
      </div>

      <div className="ticket-form__actions">
        <Link to={cancelTo} className="button button--secondary">
          Cancel
        </Link>
        <button
          type="submit"
          className="button button--primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEditMode
              ? 'Saving...'
              : 'Creating...'
            : isEditMode
              ? 'Save changes'
              : 'Create ticket'}
        </button>
      </div>
    </form>
  )
}
