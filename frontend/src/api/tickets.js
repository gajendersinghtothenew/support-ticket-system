import { apiClient } from './client'

export async function listTickets(params = {}) {
  const searchParams = new URLSearchParams()

  if (params.page) {
    searchParams.set('page', String(params.page))
  }

  const query = searchParams.toString()
  const endpoint = query ? `/tickets/?${query}` : '/tickets/'

  return apiClient(endpoint)
}

export async function getTicket(id) {
  return apiClient(`/tickets/${id}/`)
}
