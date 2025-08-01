"use client"

import { useState } from "react"
import { User, Lock, AlertCircle } from "lucide-react"
import { authAPI } from "../services/api"

// Logo Grido usando imagen PNG (import compatible con Vite/React)
import gridoLogo from "../../img/5ade3d997018f0be14c5bb72ac3a45a4.png"

const GridoLogo = () => (
  <img src={gridoLogo} alt="Grido Logo" style={{ width: 72, height: 72, borderRadius: '50%' }} />
)

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
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 overflow-hidden">
      {/* Onda azul superior */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-700 to-blue-400 rounded-b-[3rem] z-0"></div>
      {/* Onda azul inferior */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-700 to-blue-400 rounded-t-[3rem] z-0"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mx-auto mb-8 w-24 h-24 flex items-center justify-center bg-white/70 rounded-full border-4 border-blue-200 shadow-lg backdrop-blur-md">
          <GridoLogo />
        </div>
        <div className="bg-white/90 rounded-3xl shadow-2xl border-2 border-blue-100 p-8 backdrop-blur-md">
          <h1 className="text-3xl font-extrabold text-blue-800 text-center mb-2 tracking-wide drop-shadow">Bienvenido a Grido Stock</h1>
          <p className="text-blue-500 text-center font-semibold mb-6">Sistema de Control de Inventario</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-blue-700 mb-2">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="none"/><path d="M4 4l8 8 8-8"/></svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 py-2 w-full rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-blue-900 font-semibold bg-blue-50/60 placeholder-blue-300 shadow"
                  placeholder="Ingresa tu email"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-blue-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 py-2 w-full rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-blue-900 font-semibold bg-blue-50/60 placeholder-blue-300 shadow"
                  placeholder="Ingresa tu contraseña"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center space-x-2">
                <span className="font-bold">¡Error!</span>
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-red-400 hover:from-red-400 hover:to-blue-600 text-white font-extrabold text-lg shadow-lg border-2 border-blue-200 hover:border-red-400 transition-all backdrop-blur-md disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
