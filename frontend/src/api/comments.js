import { apiClient } from './client'

export async function listComments(ticketId) {
  const searchParams = new URLSearchParams()
  searchParams.set('ticket', String(ticketId))
  return apiClient(`/comments/?${searchParams.toString()}`)
}

export async function createComment({ ticket, body, is_internal = false }) {
  return apiClient('/comments/', {
    method: 'POST',
    body: {
      ticket,
      body,
      is_internal,
    },
  })
}
