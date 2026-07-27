import { formatDate } from '../../utils/formatters'
import './CommentItem.css'

export default function CommentItem({ comment }) {
  const authorName = comment.author?.username || 'Unknown'

  return (
    <article className={`comment-item ${comment.is_internal ? 'comment-item--internal' : ''}`}>
      <header className="comment-item__header">
        <div className="comment-item__author-block">
          <span className="comment-item__avatar" aria-hidden="true">
            {authorName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="comment-item__author">{authorName}</p>
            <time className="comment-item__date" dateTime={comment.created_at}>
              {formatDate(comment.created_at)}
            </time>
          </div>
        </div>
        {comment.is_internal ? (
          <span className="comment-item__internal-badge">Internal</span>
        ) : null}
      </header>
      <p className="comment-item__body">{comment.body}</p>
    </article>
  )
}
