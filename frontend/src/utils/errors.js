import { ApiError } from '../api/client'

export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  if (!(error instanceof ApiError) || !error.data) {
    return error?.message || fallback
  }

  if (typeof error.data === 'string') {
    return error.data
  }

  if (error.data.detail) {
    return error.data.detail
  }

  if (error.data.non_field_errors) {
    const message = error.data.non_field_errors
    return Array.isArray(message) ? message[0] : message
  }

  const firstField = Object.keys(error.data)[0]
  if (!firstField) {
    return fallback
  }

  const message = error.data[firstField]
  return Array.isArray(message) ? message[0] : message
}

export function getApiFieldErrors(error) {
  if (!(error instanceof ApiError) || !error.data || typeof error.data !== 'object') {
    return {}
  }

  const fieldErrors = {}

  Object.entries(error.data).forEach(([field, value]) => {
    if (field === 'detail' || field === 'non_field_errors') {
      return
    }
    fieldErrors[field] = Array.isArray(value) ? value[0] : value
  })

  return fieldErrors
}
