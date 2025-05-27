"use client"

import { useState } from "react"
import { IceCream, User, Lock, AlertCircle } from "lucide-react"
import { authAPI } from "../services/api"

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authAPI.login(credentials)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      onLogin(user)
    } catch (error) {
      setError(error.response?.data?.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <IceCream className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Heladería Stock</h1>
          <p className="text-gray-600 mt-2">Sistema de Control de Inventario</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field pl-10"
                placeholder="Ingresa tu email"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field pl-10"
                placeholder="Ingresa tu contraseña"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center mb-2">
            <strong>Credenciales de prueba:</strong>
          </p>
          <p className="text-sm text-gray-600 text-center">
            Email: <code className="bg-gray-200 px-1 rounded">admin@heladeria.com</code>
          </p>
          <p className="text-sm text-gray-600 text-center">
            Contraseña: <code className="bg-gray-200 px-1 rounded">12345678</code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
