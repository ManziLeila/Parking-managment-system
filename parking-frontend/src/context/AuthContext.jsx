import { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode' // <-- v4 uses named export

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [role, setRole] = useState(() => localStorage.getItem('role') || null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    if (!token) {
      // clear if logged out
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      setUserId(null)
      setRole(null)
      return
    }
    localStorage.setItem('token', token)
    try {
      const decoded = jwtDecode(token)
      setUserId(decoded.id || null)
      setRole(decoded.role || null)
      if (decoded.role) localStorage.setItem('role', decoded.role)
    } catch {
      // bad/expired token → reset
      setUserId(null)
      setRole(null)
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    }
  }, [token])

  const login = (jwt) => setToken(jwt)
  const logout = () => setToken(null)

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
