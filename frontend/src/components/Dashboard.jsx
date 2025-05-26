"use client"

import { useState, useEffect } from "react"
import { IceCream, Package, LogOut, AlertTriangle, TrendingUp } from "lucide-react"
import HeladeriaManager from "./HeladeriaManager"
import InsumosManager from "./InsumosManager"
import { heladosAPI, insumosAPI } from "../services/api"

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("helados")
  const [helados, setHelados] = useState([])
  const [insumos, setInsumos] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHelados: 0,
    totalInsumos: 0,
    stockBajo: 0,
    valorTotal: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [helados, insumos])

  const loadData = async () => {
    try {
      setLoading(true)
      const [heladosRes, insumosRes] = await Promise.all([heladosAPI.getAll(), insumosAPI.getAll()])

      setHelados(heladosRes.data.data || [])
      setInsumos(insumosRes.data.data || [])
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const heladosStockBajo = helados.filter((h) => h.stock <= 10).length
    const insumosStockBajo = insumos.filter((i) => i.stock <= i.stockMinimo).length
    const valorTotalHelados = helados.reduce((sum, h) => sum + h.stock * h.precio, 0)
    const valorTotalInsumos = insumos.reduce((sum, i) => sum + i.stock * (i.precio || 0), 0)

    setStats({
      totalHelados: helados.length,
      totalInsumos: insumos.length,
      stockBajo: heladosStockBajo + insumosStockBajo,
      valorTotal: valorTotalHelados + valorTotalInsumos,
    })
  }

  const alertas = [
    ...helados.filter((h) => h.stock <= 10).map((h) => ({ tipo: "Helado", nombre: h.nombre, stock: h.stock })),
    ...insumos
      .filter((i) => i.stock <= i.stockMinimo)
      .map((i) => ({ tipo: "Insumo", nombre: i.nombre, stock: i.stock })),
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <IceCream className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Heladería Stock Control</h1>
                <p className="text-sm text-gray-500">Bienvenido, {user?.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de Stock Bajo */}
        {alertas.length > 0 && (
          <div className="mb-6">
            <div className="card border-orange-200 bg-orange-50 p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-orange-800">Alertas de Stock Bajo ({alertas.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alertas.map((alerta, index) => (
                  <div key={index} className="bg-white p-3 rounded-md border border-orange-200">
                    <p className="font-medium text-orange-800">
                      {alerta.tipo}: {alerta.nombre}
                    </p>
                    <p className="text-sm text-orange-600">Stock actual: {alerta.stock}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Helados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHelados}</p>
                <p className="text-xs text-gray-500">Sabores disponibles</p>
              </div>
              <IceCream className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Insumos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInsumos}</p>
                <p className="text-xs text-gray-500">Tipos de insumos</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.stockBajo}</p>
                <p className="text-xs text-gray-500">Items con stock bajo</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">${stats.valorTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Inventario total</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("helados")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "helados"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <IceCream className="w-5 h-5 inline mr-2" />
                Gestión de Helados
              </button>
              <button
                onClick={() => setActiveTab("insumos")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "insumos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package className="w-5 h-5 inline mr-2" />
                Gestión de Insumos
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "helados" ? (
              <HeladeriaManager helados={helados} setHelados={setHelados} />
            ) : (
              <InsumosManager insumos={insumos} setInsumos={setInsumos} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
