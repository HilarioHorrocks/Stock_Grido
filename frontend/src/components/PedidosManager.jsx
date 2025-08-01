"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff, ShoppingBag, Download, FileText } from "lucide-react"
import { pedidosAPI } from "../services/api"
import { registrarCambio } from "../services/registroCambio"
import jsPDF from "jspdf"
import "jspdf-autotable"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

// SVG Logo Grido
const GridoLogo = () => {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="32" rx="28" ry="28" fill="#1B4DB1" stroke="#E53935" strokeWidth="4"/>
      <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="bold" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" dy=".3em">G</text>
    </svg>
  )
}

const PedidosManager = ({ user, refreshHistorial }) => {
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
    GrupoProducto: "Helado",
    Codigo: "",
    Cantidad: "",
    Deposito: "",
    Descripcion: "",
    Cubicaje: "",
    Peso: "",
    impuestoIva: "",
    precio: "",
    Disponible: "",
    maximo: "",
    minimo: "",
    multiplo: "",
    objetivo: "",
    cumplimiento: "",
    ObjetivoDisponible: "",
    restoMesAnterior: "",
    cuota: "",
    // ...campos antiguos para compatibilidad...
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

  // Función para exportar pedidos a Excel con las columnas requeridas
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Pedidos")
    // Definir columnas según el modelo proporcionado
    worksheet.columns = [
      { header: "GrupoProducto", key: "GrupoProducto", width: 20 },
      { header: "Codigo", key: "Codigo", width: 15 },
      { header: "Cantidad", key: "Cantidad", width: 10 },
      { header: "Deposito", key: "Deposito", width: 15 },
      { header: "Descripcion", key: "Descripcion", width: 30 },
      { header: "Cubicaje", key: "Cubicaje", width: 10 },
      { header: "Peso", key: "Peso", width: 10 },
      { header: "impuestoIva", key: "impuestoIva", width: 12 },
      { header: "precio", key: "precio", width: 12 },
      { header: "Disponible", key: "Disponible", width: 12 },
      { header: "maximo", key: "maximo", width: 10 },
      { header: "minimo", key: "minimo", width: 10 },
      { header: "multiplo", key: "multiplo", width: 10 },
      { header: "objetivo", key: "objetivo", width: 10 },
      { header: "cumplimiento", key: "cumplimiento", width: 12 },
      { header: "ObjetivoDisponible", key: "ObjetivoDisponible", width: 18 },
      { header: "restoMesAnterior", key: "restoMesAnterior", width: 18 },
      { header: "cuota", key: "cuota", width: 10 },
    ]
    // Mapear los pedidos a las columnas requeridas (ajustar según tus datos reales)
    pedidos.forEach((pedido) => {
      worksheet.addRow({
        GrupoProducto: "Helado", // o el grupo correspondiente
        Codigo: "-", // si tienes un código de producto
        Cantidad: pedido.cantidad_total,
        Deposito: "-", // si tienes un campo de depósito
        Descripcion: pedido.productos,
        Cubicaje: "-",
        Peso: "-",
        impuestoIva: "-",
        precio: pedido.precio_total,
        Disponible: "-",
        maximo: "-",
        minimo: "-",
        multiplo: "-",
        objetivo: "-",
        cumplimiento: "-",
        ObjetivoDisponible: "-",
        restoMesAnterior: "-",
        cuota: "-",
      })
    })
    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `pedidos_grido_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  // Función para guardar/actualizar pedidos usando la API
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingPedido) {
        // Actualizar pedido existente
        const response = await pedidosAPI.update(editingPedido.id, formData)
        setPedidos(pedidos.map((p) => (p.id === editingPedido.id ? response.data.data : p)))
        await registrarCambio({
          email: user.email,
          accion: "Editar",
          entidad: "Pedido",
          detalle: `Editó el pedido de ${formData.cliente_nombre}`,
        })
      } else {
        // Crear nuevo pedido
        const response = await pedidosAPI.create(formData)
        setPedidos([response.data.data, ...pedidos])
        await registrarCambio({
          email: user.email,
          accion: "Crear",
          entidad: "Pedido",
          detalle: `Creó el pedido de ${formData.cliente_nombre}`,
        })
      }
      if (refreshHistorial) refreshHistorial()
      setIsModalOpen(false)
      setEditingPedido(null)
    } catch (error) {
      setError(error.response?.data?.message || "Error al guardar pedido")
    } finally {
      setLoading(false)
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      GrupoProducto: "Helado",
      Codigo: "",
      Cantidad: "",
      Deposito: "",
      Descripcion: "",
      Cubicaje: "",
      Peso: "",
      impuestoIva: "",
      precio: "",
      Disponible: "",
      maximo: "",
      minimo: "",
      multiplo: "",
      objetivo: "",
      cumplimiento: "",
      ObjetivoDisponible: "",
      restoMesAnterior: "",
      cuota: "",
      // ...campos antiguos para compatibilidad...
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
      GrupoProducto: "Helado",
      Codigo: pedido.codigo || "",
      Cantidad: pedido.cantidad_total.toString(),
      Deposito: "-",
      Descripcion: pedido.productos,
      Cubicaje: "-",
      Peso: "-",
      impuestoIva: "-",
      precio: pedido.precio_total.toString(),
      Disponible: "-",
      maximo: "-",
      minimo: "-",
      multiplo: "-",
      objetivo: "-",
      cumplimiento: "-",
      ObjetivoDisponible: "-",
      restoMesAnterior: "-",
      cuota: "-",
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
        await registrarCambio({
          email: user.email,
          accion: "Eliminar",
          entidad: "Pedido",
          detalle: `Eliminó el pedido con id: ${id}`,
        })
        if (refreshHistorial) refreshHistorial()
      } catch (error) {
        setError(error.response?.data?.message || "Error al eliminar pedido")
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-yellow-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-2 border-blue-200">
          <div className="text-center mb-6">
            {/* Logo Grido */}
            <div className="flex justify-center mb-4">
              {/* Si tienes un logo SVG, reemplaza el div de abajo */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-yellow-400 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-extrabold text-white drop-shadow">G</span>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-blue-700">Pedidos a Grido</h2>
            <p className="text-blue-500">Ingresa la contraseña para acceder</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-2 border border-blue-300 rounded pr-10 focus:ring-2 focus:ring-blue-400"
                  placeholder="Ingresa la contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-blue-400" /> : <Eye className="h-4 w-4 text-blue-400" />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-yellow-400 text-white py-2 px-4 rounded-lg font-bold shadow hover:from-blue-700 hover:to-yellow-500 transition-colors">
              Acceder
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Pantalla principal de gestión
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
      <div className="flex items-center mb-8 space-x-4">
        <div className="backdrop-blur-md bg-white/60 rounded-full p-2 border-4 border-blue-200 shadow-lg">
          <GridoLogo />
        </div>
        <h2 className="text-2xl font-extrabold text-blue-800 drop-shadow tracking-wide">Gestión de Pedidos</h2>
      </div>
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={exportToPDF}
          className="bg-gradient-to-r from-blue-500 to-red-400 hover:from-red-400 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-full border-2 border-blue-200 hover:border-red-400 shadow-lg transition-all backdrop-blur-md"
        >
          Exportar PDF
        </button>
        <button
          onClick={exportToExcel}
          className="bg-gradient-to-r from-blue-500 to-red-400 hover:from-red-400 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-full border-2 border-blue-200 hover:border-red-400 shadow-lg transition-all backdrop-blur-md"
        >
          Exportar Excel
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-red-400 hover:from-red-400 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-full border-2 border-blue-200 hover:border-red-400 shadow-lg transition-all backdrop-blur-md"
        >
          Nuevo Pedido
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-lg">
        <table className="min-w-full bg-white border border-blue-100 rounded-2xl">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Productos</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Fecha Entrega</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {pedidos.map((pedido, idx) => (
              <tr key={pedido.id} className={idx % 2 === 0 ? "bg-blue-50/40" : "bg-white"}>
                <td className="px-6 py-4 font-bold text-blue-900">{pedido.cliente_nombre}</td>
                <td className="px-6 py-4 text-blue-700">{pedido.cliente_telefono}</td>
                <td className="px-6 py-4 text-blue-700">{pedido.productos}</td>
                <td className="px-6 py-4 text-blue-900 font-semibold">${pedido.precio_total}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full border-2 border-blue-200 ${getEstadoColor(pedido.estado)}`}>
                    {pedido.estado.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-blue-700">
                  {pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString() : "No definida"}
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <button
                    onClick={() => exportSinglePedido(pedido)}
                    className="text-blue-500 hover:text-red-400 font-bold"
                    title="Exportar este pedido"
                  >
                    Exportar
                  </button>
                  <button onClick={() => handleEdit(pedido)} className="text-blue-500 hover:text-red-400 font-bold">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(pedido.id)} className="text-red-500 hover:text-blue-700 font-bold">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pedidos.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-blue-400 font-semibold">No hay pedidos registrados. ¡Crea el primer pedido a Grido!</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-blue-400 font-semibold">Cargando pedidos...</p>
        </div>
      )}

      {/* Modal de Crear/Editar Pedido */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 rounded-2xl max-w-2xl w-full p-8 border-4 border-blue-200 shadow-2xl backdrop-blur-md">
            <div className="flex items-center mb-4">
              <div className="mr-3"><GridoLogo /></div>
              <h3 className="text-xl font-bold text-blue-700">{editingPedido ? "Editar Pedido" : "Nuevo Pedido"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Producto</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Ej: Helado"
                    value={formData.GrupoProducto}
                    onChange={e => setFormData({ ...formData, GrupoProducto: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.Codigo}
                    onChange={e => setFormData({ ...formData, Codigo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.Cantidad}
                    onChange={e => setFormData({ ...formData, Cantidad: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depósito</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.Deposito}
                    onChange={e => setFormData({ ...formData, Deposito: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.Descripcion}
                  onChange={e => setFormData({ ...formData, Descripcion: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cubicaje</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.Cubicaje}
                    onChange={e => setFormData({ ...formData, Cubicaje: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.Peso}
                    onChange={e => setFormData({ ...formData, Peso: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impuesto IVA</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.impuestoIva}
                    onChange={e => setFormData({ ...formData, impuestoIva: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.precio}
                    onChange={e => setFormData({ ...formData, precio: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponible</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.Disponible}
                    onChange={e => setFormData({ ...formData, Disponible: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.maximo}
                    onChange={e => setFormData({ ...formData, maximo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.minimo}
                    onChange={e => setFormData({ ...formData, minimo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Múltiplo</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.multiplo}
                    onChange={e => setFormData({ ...formData, multiplo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.objetivo}
                    onChange={e => setFormData({ ...formData, objetivo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cumplimiento</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.cumplimiento}
                    onChange={e => setFormData({ ...formData, cumplimiento: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo Disponible</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.ObjetivoDisponible}
                    onChange={e => setFormData({ ...formData, ObjetivoDisponible: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resto Mes Anterior</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.restoMesAnterior}
                    onChange={e => setFormData({ ...formData, restoMesAnterior: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuota</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.cuota}
                  onChange={e => setFormData({ ...formData, cuota: e.target.value })}
                />
              </div>
              {/* ...campos antiguos si quieres mantenerlos... */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-blue-100 text-blue-900 py-2 px-4 rounded-lg hover:bg-blue-200 font-bold shadow"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-red-400 font-bold shadow disabled:opacity-50"
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
