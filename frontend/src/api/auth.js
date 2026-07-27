import {
  apiClient,
  clearStoredAuth,
  setStoredAuth,
} from './client'

export async function login(credentials) {
  const data = await apiClient('/auth/login/', {
    method: 'POST',
    body: credentials,
    token: null,
  })
  setStoredAuth(data.token, data.user)
  return data
}

export async function register(userData) {
  const data = await apiClient('/auth/register/', {
    method: 'POST',
    body: userData,
    token: null,
  })
  setStoredAuth(data.token, data.user)
  return data
}

export async function getMe() {
  return apiClient('/auth/me/')
}

export function logout() {
  clearStoredAuth()
}
