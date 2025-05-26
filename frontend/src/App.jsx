"use client"

import { useState, useEffect } from "react"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import { authAPI } from "./services/api"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const response = await authAPI.verify()
        if (response.data.valid) {
          setIsAuthenticated(true)
          setUser(response.data.user)
        } else {
          localStorage.removeItem("token")
        }
      }
    } catch (error) {
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </div>
  )
}

export default App
