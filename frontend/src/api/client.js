const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export function setStoredAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiClient(endpoint, options = {}) {
  const { method = 'GET', body, token } = options
  const headers = {
    'Content-Type': 'application/json',
  }

  const authToken = token === null ? null : token ?? getStoredToken()
  if (authToken) {
    headers.Authorization = `Token ${authToken}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let data = null
    try {
      data = await response.json()
    } catch {
      data = null
    }

    throw new ApiError(
      data?.detail || `Request failed with status ${response.status}`,
      response.status,
      data,
    )
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
