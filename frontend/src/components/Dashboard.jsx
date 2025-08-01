"use client"

import { useState, useEffect, useCallback } from "react"
import { IceCream, Package, LogOut, AlertTriangle, TrendingUp, Candy, ShoppingBag } from "lucide-react"
import HeladeriaManager from "./HeladeriaManager"
import InsumosManager from "./InsumosManager"
import ImpulsivosManager from "./ImpulsivosManager"
import PedidosManager from "./PedidosManager"
import HistorialEmpleados from "./HistorialEmpleados"

import { heladosAPI, insumosAPI } from "../services/api"

// Logo Grido usando imagen PNG (import compatible con Vite/React)
import gridoLogo from "../../img/5ade3d997018f0be14c5bb72ac3a45a4.png"

const GridoLogo = () => (
  <img src={gridoLogo} alt="Grido Logo" style={{ width: 56, height: 56, borderRadius: '50%' }} />
)

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
  // Estado para refrescar historial
  const [historialRefresh, setHistorialRefresh] = useState(0)
  // Función para refrescar historial
  const refreshHistorial = useCallback(() => setHistorialRefresh(r => r + 1), [])

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
    <div className="min-h-screen bg-white font-[Quicksand,sans-serif]">
      {/* Header con onda azul */}
      <header className="relative bg-gradient-to-b from-blue-700 to-blue-400 shadow-lg rounded-b-[3rem] pb-8 mb-8">
        <div className="absolute bottom-0 left-0 w-full h-8 bg-white rounded-t-[2rem] z-10" style={{boxShadow:'0 -8px 24px 0 #1B4DB1, 0 -2px 0 #fff'}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center relative z-20">
          <div className="flex items-center space-x-4">
            <div className="backdrop-blur-md bg-white/60 rounded-full p-2 border-4 border-blue-200 shadow-lg">
              <GridoLogo />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide">Grido Stock</h1>
              <p className="text-base text-blue-100 font-semibold">Bienvenido, {user?.username}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-white bg-gradient-to-r from-blue-600 to-red-400 hover:from-red-400 hover:to-blue-600 font-bold py-2 px-6 rounded-full border-2 border-white/40 shadow-lg transition-all backdrop-blur-md"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Alertas de Stock Bajo */}
        {alertas.length > 0 && (
          <div className="mb-8">
            <div className="rounded-3xl border-2 border-red-200 bg-red-50/80 p-6 shadow-lg flex flex-col gap-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-7 h-7 text-red-400 mr-3" />
                <h3 className="text-xl font-bold text-red-700">¡Atención! Stock Bajo ({alertas.length})</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {alertas.map((alerta, index) => (
                  <div key={index} className="bg-white/80 p-3 rounded-xl border border-red-100 shadow text-red-700 font-semibold text-sm">
                    {alerta.tipo}: <span className="font-bold">{alerta.nombre}</span> (Stock: {alerta.stock})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="rounded-3xl p-6 bg-white/90 border-2 border-blue-200 shadow-xl flex flex-col items-center">
            <IceCream className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-lg font-bold text-blue-700">Helados</p>
            <p className="text-3xl font-extrabold text-blue-900">{stats.totalHelados}</p>
            <p className="text-xs text-blue-400 mt-1">Sabores</p>
          </div>
          <div className="rounded-3xl p-6 bg-white/90 border-2 border-blue-200 shadow-xl flex flex-col items-center">
            <Package className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-lg font-bold text-blue-700">Insumos</p>
            <p className="text-3xl font-extrabold text-blue-900">{stats.totalInsumos}</p>
            <p className="text-xs text-blue-400 mt-1">Tipos</p>
          </div>
          <div className="rounded-3xl p-6 bg-white/90 border-2 border-red-200 shadow-xl flex flex-col items-center">
            <AlertTriangle className="h-10 w-10 text-red-400 mb-2" />
            <p className="text-lg font-bold text-red-700">Alertas</p>
            <p className="text-3xl font-extrabold text-red-600">{stats.stockBajo}</p>
            <p className="text-xs text-red-400 mt-1">Stock bajo</p>
          </div>
          {/* Caja de Valor Total solo para admin */}
          {user?.email === "admin@heladeria.com" && (
            <div className="rounded-3xl p-6 bg-white/90 border-2 border-blue-200 shadow-xl flex flex-col items-center">
              <TrendingUp className="h-10 w-10 text-blue-500 mb-2" />
              <p className="text-lg font-bold text-blue-700">Valor Total</p>
              <p className="text-3xl font-extrabold text-blue-900">${stats.valorTotal.toFixed(2)}</p>
              <p className="text-xs text-blue-400 mt-1">Inventario</p>
            </div>
          )}
        </div>
        {/* Tabs */}
        <div className="rounded-3xl border-2 border-blue-200 bg-white/80 shadow-xl">
          <div className="border-b border-blue-100 rounded-t-3xl">
            <nav className="-mb-px flex space-x-8 px-6">
              {/* ...Helados, Insumos, Impulsivos tabs... */}
              <button
                onClick={() => setActiveTab("helados")}
                className={`py-4 px-1 border-b-4 font-bold text-base transition-colors ${
                  activeTab === "helados"
                    ? "border-blue-500 text-blue-700 bg-blue-50/60 rounded-t-2xl"
                    : "border-transparent text-blue-400 hover:text-blue-700 hover:border-blue-200"
                }`}
              >
                <IceCream className="w-5 h-5 inline mr-2" />
                Helados
              </button>
              <button
                onClick={() => setActiveTab("insumos")}
                className={`py-4 px-1 border-b-4 font-bold text-base transition-colors ${
                  activeTab === "insumos"
                    ? "border-blue-500 text-blue-700 bg-blue-50/60 rounded-t-2xl"
                    : "border-transparent text-blue-400 hover:text-blue-700 hover:border-blue-200"
                }`}
              >
                <Package className="w-5 h-5 inline mr-2" />
                Insumos
              </button>
              <button
                onClick={() => setActiveTab("impulsivos")}
                className={`py-4 px-1 border-b-4 font-bold text-base transition-colors ${
                  activeTab === "impulsivos"
                    ? "border-blue-500 text-blue-700 bg-blue-50/60 rounded-t-2xl"
                    : "border-transparent text-blue-400 hover:text-blue-700 hover:border-blue-200"
                }`}
              >
                <Candy className="w-5 h-5 inline mr-2" />
                Impulsivos
              </button>
              {/* Tab Pedidos solo para admin */}
              {user?.email === "admin@heladeria.com" && (
                <button
                  onClick={() => setActiveTab("pedidos")}
                  className={`py-4 px-1 border-b-4 font-bold text-base transition-colors ${
                    activeTab === "pedidos"
                      ? "border-blue-500 text-blue-700 bg-blue-50/60 rounded-t-2xl"
                      : "border-transparent text-blue-400 hover:text-blue-700 hover:border-blue-200"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 inline mr-2" />
                  Pedidos
                </button>
              )}
            </nav>
          </div>
          <div className="p-8">
            {activeTab === "helados" ? (
              <HeladeriaManager helados={helados} setHelados={setHelados} user={user} refreshHistorial={refreshHistorial} />
            ) : activeTab === "insumos" ? (
              <InsumosManager insumos={insumos} setInsumos={setInsumos} user={user} refreshHistorial={refreshHistorial} />
            ) : activeTab === "impulsivos" ? (
              <ImpulsivosManager user={user} refreshHistorial={refreshHistorial} />
            ) : (
              // Render PedidosManager solo si es admin
              user?.email === "admin@heladeria.com" ? (
                <PedidosManager user={user} refreshHistorial={refreshHistorial} />
              ) : null
            )}
          </div>
        </div>
      </main>
      {/* Historial de Cambios de Empleados */}
      <HistorialEmpleados refresh={historialRefresh} />
    </div>
  )
}

export default Dashboard
