import CommentItem from './CommentItem'
import './CommentList.css'

export default function CommentList({ comments }) {
  if (!comments.length) {
    return (
      <div className="comment-list comment-list--empty">
        <p>No comments yet. Be the first to reply.</p>
      </div>
    )
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
