"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IceCream, User } from "lucide-react"
import Dashboard from "./dashboard/page"

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Credenciales de ejemplo para el admin
    if (credentials.username === "admin" && credentials.password === "admin123") {
      setIsLoggedIn(true)
      setError("")
    } else {
      setError("Credenciales incorrectas")
    }
  }

  if (isLoggedIn) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <IceCream className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Heladería Stock</CardTitle>
          <CardDescription>Sistema de Control de Inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full">
              <User className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Credenciales de prueba:</p>
            <p>
              Usuario: <strong>admin</strong>
            </p>
            <p>
              Contraseña: <strong>admin123</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
