import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import * as authApi from '../api/auth'
import { getStoredToken, getStoredUser, setStoredAuth } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => getStoredToken())
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(() => {
    authApi.logout()
    setUser(null)
    setToken(null)
  }, [])

  const establishSession = useCallback((session) => {
    setToken(session.token)
    setUser(session.user)
  }, [])

  const login = useCallback(async (credentials) => {
    const session = await authApi.login(credentials)
    establishSession(session)
    return session
  }, [establishSession])

  const register = useCallback(async (userData) => {
    const session = await authApi.register(userData)
    establishSession(session)
    return session
  }, [establishSession])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  useEffect(() => {
    async function bootstrapAuth() {
      const storedToken = getStoredToken()
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await authApi.getMe()
        setUser(currentUser)
        setToken(storedToken)
        setStoredAuth(storedToken, currentUser)
      } catch {
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    bootstrapAuth()
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
