"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff, ShoppingBag, Download, FileText } from "lucide-react"
import { pedidosAPI } from "../services/api"
import jsPDF from "jspdf"
import "jspdf-autotable"

const PedidosManager = () => {
  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")

  // Estados de pedidos
  const [pedidos, setPedidos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPedido, setEditingPedido] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados del formulario
  const [formData, setFormData] = useState({
    cliente_nombre: "",
    cliente_telefono: "",
    cliente_direccion: "",
    productos: "",
    cantidad_total: "",
    precio_total: "",
    estado: "pendiente",
    fecha_entrega: "",
    observaciones: "",
  })

  // Contraseña para acceder
  const ADMIN_PASSWORD = "grido2024"
  const estados = ["pendiente", "en_proceso", "listo", "entregado", "cancelado"]

  // Función de login
  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setLoginError("")
    } else {
      setLoginError("Contraseña incorrecta")
    }
  }

  // Cargar pedidos cuando se autentica
  useEffect(() => {
    if (isAuthenticated) {
      loadPedidos()
    }
  }, [isAuthenticated])

  // Función para cargar pedidos usando la API
  const loadPedidos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await pedidosAPI.getAll()
      setPedidos(response.data.data || [])
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
      setError(error.message || "Error al cargar pedidos. Verifica la conexión.")
    } finally {
      setLoading(false)
    }
  }

  // Función simple para exportar todos los pedidos a PDF
  const exportToPDF = () => {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(16)
    doc.text("PEDIDOS A GRIDO - Reabastecimiento", 20, 20)
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 20, 30)

    // Datos para la tabla
    const tableData = pedidos.map((pedido) => [
      pedido.id,
      pedido.cliente_nombre,
      pedido.cliente_telefono,
      pedido.productos.substring(0, 30) + (pedido.productos.length > 30 ? "..." : ""),
      pedido.cantidad_total,
      `$${pedido.precio_total}`,
      pedido.estado.toUpperCase(),
      new Date(pedido.created_at).toLocaleDateString(),
    ])

    // Crear tabla
    doc.autoTable({
      head: [["ID", "Proveedor", "Contacto", "Productos", "Cant.", "Total", "Estado", "Fecha"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
    })

    // Descargar
    doc.save(`pedidos_grido_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  // Función simple para exportar un pedido individual
  const exportSinglePedido = (pedido) => {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text("PEDIDO A GRIDO", 20, 20)
    doc.setFontSize(12)
    doc.text(`Pedido #${pedido.id}`, 20, 35)

    const y = 50
    doc.setFontSize(10)
    doc.text(`Proveedor: ${pedido.cliente_nombre}`, 20, y)
    doc.text(`Contacto: ${pedido.cliente_telefono}`, 20, y + 10)
    doc.text(`Productos: ${pedido.productos}`, 20, y + 20)
    doc.text(`Total: $${pedido.precio_total}`, 20, y + 30)
    doc.text(`Estado: ${pedido.estado.toUpperCase()}`, 20, y + 40)

    if (pedido.observaciones) {
      doc.text(`Observaciones: ${pedido.observaciones}`, 20, y + 50)
    }

    doc.save(`pedido_grido_${pedido.id}.pdf`)
  }

  // Función para guardar/actualizar pedidos usando la API
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingPedido) {
        // Actualizar pedido existente
        const response = await pedidosAPI.update(editingPedido.id, formData)
        setPedidos(pedidos.map((p) => (p.id === editingPedido.id ? response.data.data : p)))
      } else {
        // Crear nuevo pedido
        const response = await pedidosAPI.create(formData)
        setPedidos([response.data.data, ...pedidos])
      }

      resetForm()
    } catch (error) {
      console.error("Error al guardar pedido:", error)
      setError(`Error al guardar pedido: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      cliente_nombre: "",
      cliente_telefono: "",
      cliente_direccion: "",
      productos: "",
      cantidad_total: "",
      precio_total: "",
      estado: "pendiente",
      fecha_entrega: "",
      observaciones: "",
    })
    setEditingPedido(null)
    setIsModalOpen(false)
  }

  // Editar pedido
  const handleEdit = (pedido) => {
    setEditingPedido(pedido)
    setFormData({
      cliente_nombre: pedido.cliente_nombre,
      cliente_telefono: pedido.cliente_telefono,
      cliente_direccion: pedido.cliente_direccion || "",
      productos: pedido.productos,
      cantidad_total: pedido.cantidad_total.toString(),
      precio_total: pedido.precio_total.toString(),
      estado: pedido.estado,
      fecha_entrega: pedido.fecha_entrega ? pedido.fecha_entrega.slice(0, 16) : "",
      observaciones: pedido.observaciones || "",
    })
    setIsModalOpen(true)
  }

  // Función para eliminar pedidos usando la API
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este pedido?")) {
      try {
        await pedidosAPI.delete(id)
        setPedidos(pedidos.filter((p) => p.id !== id))
      } catch (error) {
        console.error("Error al eliminar pedido:", error)
        setError(`Error al eliminar pedido: ${error.message}`)
      }
    }
  }

  // Obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "text-yellow-600 bg-yellow-100"
      case "en_proceso":
        return "text-blue-600 bg-blue-100"
      case "listo":
        return "text-green-600 bg-green-100"
      case "entregado":
        return "text-gray-600 bg-gray-100"
      case "cancelado":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  // Cerrar mensaje de error
  const handleCloseError = () => {
    setError(null)
  }

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <div className="text-center mb-6">
              <ShoppingBag className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Pedidos a Grido</h2>
              <p className="text-gray-600">Ingresa la contraseña para acceder</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full p-2 border border-gray-300 rounded pr-10"
                    placeholder="Ingresa la contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Acceder
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla principal de gestión
  return (
    <div className="space-y-6">
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <p>{error}</p>
            <button onClick={handleCloseError} className="text-red-600 hover:text-red-800 text-xl">
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pedidos a Grido</h2>
          <p className="text-gray-600">Gestiona los pedidos para reabastecer tu heladería</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportToPDF}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Pedido</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Entrega
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{pedido.cliente_nombre}</div>
                  {pedido.cliente_direccion && <div className="text-xs text-gray-500">{pedido.cliente_direccion}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{pedido.cliente_telefono}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate text-gray-500" title={pedido.productos}>
                    {pedido.productos}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">${pedido.precio_total}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(pedido.estado)}`}>
                    {pedido.estado.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString() : "No definida"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => exportSinglePedido(pedido)}
                    className="text-green-600 hover:text-green-900"
                    title="Exportar este pedido"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(pedido)} className="text-blue-600 hover:text-blue-900">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(pedido.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pedidos.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay pedidos registrados. ¡Crea el primer pedido a Grido!</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando pedidos...</p>
        </div>
      )}

      {/* Modal de Crear/Editar Pedido */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingPedido ? "Editar Pedido a Grido" : "Nuevo Pedido a Grido"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Grido Central"
                    value={formData.cliente_nombre}
                    onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                  <input
                    type="tel"
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Teléfono del proveedor"
                    value={formData.cliente_telefono}
                    onChange={(e) => setFormData({ ...formData, cliente_telefono: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección del Proveedor</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Dirección del proveedor (opcional)"
                  value={formData.cliente_direccion}
                  onChange={(e) => setFormData({ ...formData, cliente_direccion: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Productos a Solicitar</label>
                <textarea
                  required
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ej: 10x Helado Chocolate 1kg, 5x Helado Vainilla 1kg, 3x Torta Helada..."
                  value={formData.productos}
                  onChange={(e) => setFormData({ ...formData, productos: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Total</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="0"
                    value={formData.cantidad_total}
                    onChange={(e) => setFormData({ ...formData, cantidad_total: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Total ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="0.00"
                    value={formData.precio_total}
                    onChange={(e) => setFormData({ ...formData, precio_total: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega Estimada</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.fecha_entrega}
                  onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Notas adicionales sobre el pedido..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : editingPedido ? "Actualizar" : "Crear Pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PedidosManager
