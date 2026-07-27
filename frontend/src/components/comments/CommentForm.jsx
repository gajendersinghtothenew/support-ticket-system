import { useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../utils/errors'
import './CommentForm.css'

export default function CommentForm({ onSubmit }) {
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canPostInternal = user?.role === 'agent' || user?.role === 'admin'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const trimmedBody = body.trim()
    if (trimmedBody.length < 2) {
      setError('Comment must be at least 2 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        body: trimmedBody,
        is_internal: canPostInternal ? isInternal : false,
      })
      setBody('')
      setIsInternal(false)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to post comment.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor="comment-body" className="comment-form__label">
        Add a comment
      </label>
      <textarea
        id="comment-body"
        name="body"
        rows={4}
        required
        minLength={2}
        placeholder="Write your reply..."
        value={body}
        onChange={(event) => setBody(event.target.value)}
        disabled={isSubmitting}
      />

      {canPostInternal ? (
        <label className="comment-form__checkbox">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(event) => setIsInternal(event.target.checked)}
            disabled={isSubmitting}
          />
          Internal note (visible to agents only)
        </label>
      ) : null}

      {error ? <p className="comment-form__error">{error}</p> : null}

      <button
        type="submit"
        className="button button--primary"
        disabled={isSubmitting || body.trim().length < 2}
      >
        {isSubmitting ? 'Posting...' : 'Post comment'}
      </button>
    </form>
  )
}
