import { apiClient } from './client'

export async function listTickets(params = {}) {
  const searchParams = new URLSearchParams()

  if (params.page) {
    searchParams.set('page', String(params.page))
  }
  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim())
  }
  if (params.status) {
    searchParams.set('status', params.status)
  }
  if (params.priority) {
    searchParams.set('priority', params.priority)
  }
  if (params.category) {
    searchParams.set('category', params.category)
  }

  const query = searchParams.toString()
  const endpoint = query ? `/tickets/?${query}` : '/tickets/'

  return apiClient(endpoint)
}

export async function getTicketStats() {
  return apiClient('/tickets/stats/')
}

export async function getTicket(id) {
  return apiClient(`/tickets/${id}/`)
}

export async function createTicket(payload) {
  return apiClient('/tickets/', {
    method: 'POST',
    body: payload,
  })
}

export async function updateTicket(id, payload) {
  return apiClient(`/tickets/${id}/`, {
    method: 'PATCH',
    body: payload,
  })
}

export async function updateTicketStatus(id, status) {
  return updateTicket(id, { status })
}
