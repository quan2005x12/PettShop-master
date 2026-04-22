import { createContext, useContext, useState, useEffect } from 'react'
import { fetchMe, loginWithGoogle as apiLogin } from '../api'

const AuthContext = createContext()
const storageKey = 'pett_auth_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pett_token')
      if (token) {
        try {
          const userData = await fetchMe()
          setUser(userData)
        } catch (err) {
          console.error('Failed to restore session:', err)
          localStorage.removeItem('pett_token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const loginWithGoogle = async (googleToken) => {
    try {
      console.log('Logging in with Google token...')
      const response = await apiLogin(googleToken)
      const jwtToken = response.access_token
      console.log('Backend JWT received')
      
      localStorage.setItem('pett_token', jwtToken)
      
      // Fetch real user data from our backend immediately using the token
      const userData = await fetchMe(jwtToken)
      console.log('Real user data fetched:', userData)
      
      setUser(userData)
      localStorage.setItem(storageKey, JSON.stringify(userData))
      
      return userData
    } catch (err) {
      console.error('Login flow failed:', err)
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pett_token')
    localStorage.removeItem(storageKey)
    localStorage.removeItem('pett_stitch_cart_v2') // Clear the cart too
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('pett_token')
    if (token) {
      try {
        const userData = await fetchMe()
        setUser(userData)
        localStorage.setItem(storageKey, JSON.stringify(userData))
      } catch (err) {
        console.error('Failed to refresh user:', err)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
