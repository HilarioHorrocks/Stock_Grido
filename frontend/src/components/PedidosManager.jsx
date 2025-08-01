"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff, ShoppingBag, Download, FileText } from "lucide-react"
import { pedidosAPI, heladosAPI, insumosAPI, impulsivosAPI } from "../services/api"
import { registrarCambio } from "../services/registroCambio"
import jsPDF from "jspdf"
import "jspdf-autotable"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import heladosCatalogo from '../data/heladosCatalogo.js'

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

  // Estados para carga rápida
  const [isCargaRapidaOpen, setIsCargaRapidaOpen] = useState(false)
  const [cargaRapidaHelados, setCargaRapidaHelados] = useState([])
  const [cargaRapidaImpulsivos, setCargaRapidaImpulsivos] = useState([])
  const [cargaRapidaInsumos, setCargaRapidaInsumos] = useState([])
  const [cargaRapidaLoading, setCargaRapidaLoading] = useState(false)

  // Estados para edición rápida
  const [isEditarRapidoOpen, setIsEditarRapidoOpen] = useState(false)
  const [editarRapidoPedido, setEditarRapidoPedido] = useState(null)
  const [editarRapidoHelados, setEditarRapidoHelados] = useState([])
  const [editarRapidoImpulsivos, setEditarRapidoImpulsivos] = useState([])
  const [editarRapidoInsumos, setEditarRapidoInsumos] = useState([])
  const [editarRapidoLoading, setEditarRapidoLoading] = useState(false)
  const [editarRapidoEstado, setEditarRapidoEstado] = useState("")

  // Contraseña para acceder
  const ADMIN_PASSWORD = "grido2024"
  const estados = ["pendiente", "en_proceso", "listo", "entregado", "cancelado"]

  // Cargar pedidos cuando se autentica
  useEffect(() => {
    loadPedidos()
  }, [])

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
    // Mapear los pedidos a las columnas requeridas (una fila por producto)
    pedidos.forEach((pedido) => {
      // Detectar si es un pedido batch (productos separados por coma)
      let productos = []
      if (pedido.productos && pedido.productos.includes(",")) {
        // Separar por coma y extraer nombre y cantidad
        productos = pedido.productos.split(",").map(p => p.trim())
      } else if (pedido.productos) {
        productos = [pedido.productos]
      }
      if (productos.length > 1) {
        // Si es batch, una fila por producto
        productos.forEach((prod) => {
          // Extraer nombre y cantidad si está en formato "Nombre (xCantidad)"
          const match = prod.match(/(.+) \(x(\d+)\)/)
          worksheet.addRow({
            GrupoProducto: pedido.GrupoProducto || "-",
            Codigo: pedido.Codigo || "-",
            Cantidad: match ? match[2] : pedido.Cantidad || 1,
            Deposito: pedido.Deposito || "-",
            Descripcion: match ? match[1] : prod,
            Cubicaje: pedido.Cubicaje || "-",
            Peso: pedido.Peso || "-",
            impuestoIva: pedido.impuestoIva || "-",
            precio: pedido.precio || pedido.precio_total || "-",
            Disponible: pedido.Disponible || "-",
            maximo: pedido.maximo || "-",
            minimo: pedido.minimo || "-",
            multiplo: pedido.multiplo || "-",
            objetivo: pedido.objetivo || "-",
            cumplimiento: pedido.cumplimiento || "-",
            ObjetivoDisponible: pedido.ObjetivoDisponible || "-",
            restoMesAnterior: pedido.restoMesAnterior || "-",
            cuota: pedido.cuota || "-",
          })
        })
      } else {
        // Pedido simple, una sola fila
        worksheet.addRow({
          GrupoProducto: pedido.GrupoProducto || "-",
          Codigo: pedido.Codigo || "-",
          Cantidad: pedido.Cantidad || pedido.cantidad_total || 1,
          Deposito: pedido.Deposito || "-",
          Descripcion: pedido.productos || "-",
          Cubicaje: pedido.Cubicaje || "-",
          Peso: pedido.Peso || "-",
          impuestoIva: pedido.impuestoIva || "-",
          precio: pedido.precio || pedido.precio_total || "-",
          Disponible: pedido.Disponible || "-",
          maximo: pedido.maximo || "-",
          minimo: pedido.minimo || "-",
          multiplo: pedido.multiplo || "-",
          objetivo: pedido.objetivo || "-",
          cumplimiento: pedido.cumplimiento || "-",
          ObjetivoDisponible: pedido.ObjetivoDisponible || "-",
          restoMesAnterior: pedido.restoMesAnterior || "-",
          cuota: pedido.cuota || "-",
        })
      }
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
  const handleEdit = async (pedido) => {
    // Si es batch, abrir modal de edición rápida
    if (pedido.GrupoProducto === "Batch") {
      setEditarRapidoPedido(pedido)
      setEditarRapidoLoading(true)
      setIsEditarRapidoOpen(true)
      // Parsear productos
      let helados = heladosCatalogo.map(h => ({ ...h, cantidad: '', precio: h.precio || '' }))
      let impulsivos = []
      let insumos = []
      try {
        const [impulsivosRes, insumosRes] = await Promise.all([
          impulsivosAPI.getAll(),
          insumosAPI.getAll(),
        ])
        impulsivos = (impulsivosRes.data.data || []).map(i => ({ ...i, cantidad: '', precio: i.precio || '' }))
        insumos = (insumosRes.data.data || []).map(ins => ({ ...ins, cantidad: '', precio: ins.precio || '' }))
        // Parsear cantidades y precios del pedido
        if (pedido.productos) {
          const productosArr = pedido.productos.split(",").map(p => p.trim())
          productosArr.forEach(prod => {
            const match = prod.match(/(.+) \(x(\d+)\)/)
            const nombre = match ? match[1] : prod
            const cantidad = match ? match[2] : ''
            // Buscar en helados
            let found = false
            helados = helados.map(h => h.nombre === nombre ? { ...h, cantidad, precio: h.precio } : h)
            if (helados.some(h => h.nombre === nombre)) found = true
            // Buscar en impulsivos
            impulsivos = impulsivos.map(i => i.nombre === nombre ? { ...i, cantidad, precio: i.precio } : i)
            if (impulsivos.some(i => i.nombre === nombre)) found = true
            // Buscar en insumos
            insumos = insumos.map(ins => ins.nombre === nombre ? { ...ins, cantidad, precio: ins.precio } : ins)
          })
        }
        setEditarRapidoHelados(helados)
        setEditarRapidoImpulsivos(impulsivos)
        setEditarRapidoInsumos(insumos)
        setEditarRapidoEstado(pedido.estado || "pendiente")
      } catch (e) {
        alert('Error al cargar productos para edición rápida')
        setIsEditarRapidoOpen(false)
      } finally {
        setEditarRapidoLoading(false)
      }
    } else {
      // ...original handleEdit para pedidos simples...
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

  // Carga productos para carga rápida
  const openCargaRapida = async () => {
    setCargaRapidaLoading(true)
    setIsCargaRapidaOpen(true)
    try {
      // Usar catálogo fijo para helados
      setCargaRapidaHelados(
        heladosCatalogo.map(h => ({ ...h, cantidad: '', precio: h.precio || '' }))
      )
      // Impulsivos e insumos sí se consultan de la base
      const [impulsivosRes, insumosRes] = await Promise.all([
        impulsivosAPI.getAll(),
        insumosAPI.getAll(),
      ])
      setCargaRapidaImpulsivos(
        (impulsivosRes.data.data || []).map(i => ({ ...i, cantidad: '', precio: i.precio || '' }))
      )
      setCargaRapidaInsumos(
        (insumosRes.data.data || []).map(ins => ({ ...ins, cantidad: '', precio: ins.precio || '' }))
      )
    } catch (e) {
      alert('Error al cargar productos para carga rápida')
    } finally {
      setCargaRapidaLoading(false)
    }
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
          onClick={openCargaRapida}
          className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white font-bold py-2 px-6 rounded-full border-2 border-blue-200 shadow-lg transition-all backdrop-blur-md"
        >
          <Plus className="w-5 h-5 inline mr-1" /> Carga rápida
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
                    onClick={() => exportSinglePedidoExcel(pedido)}
                    className="text-blue-500 hover:text-red-400 font-bold"
                    title="Exportar este pedido"
                  >
                    Exportar
                  </button>
                  <button
                    onClick={() => {
                      // Abrir modal de edición solo para productos seleccionados y estado
                      // Parsear productos seleccionados
                      const productosArr = pedido.productos ? pedido.productos.split(",").map(p => p.trim()) : [];
                      // Separar en helados, impulsivos, insumos según catálogo
                      let helados = [];
                      let impulsivos = [];
                      let insumos = [];
                      productosArr.forEach(prod => {
                        const match = prod.match(/(.+) \(x(\d+)\)/);
                        const nombre = match ? match[1] : prod;
                        const cantidad = match ? match[2] : '';
                        // Buscar en helados
                        const h = heladosCatalogo.find(h => h.nombre === nombre);
                        if (h) {
                          helados.push({ ...h, cantidad, precio: h.precio || '' });
                          return;
                        }
                        // Buscar en impulsivos e insumos si tienes catálogos
                        // Si no, simplemente los ignoramos aquí
                      });
                      setEditarRapidoPedido(pedido);
                      setEditarRapidoHelados(helados);
                      setEditarRapidoImpulsivos(impulsivos);
                      setEditarRapidoInsumos(insumos);
                      setEditarRapidoEstado(pedido.estado || 'pendiente');
                      setIsEditarRapidoOpen(true);
                    }}
                    className="text-blue-500 hover:text-red-400 font-bold"
                    title="Editar este pedido"
                  >
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
          <div className="bg-white/90 rounded-2xl max-w-4xl w-full p-8 border-4 border-blue-200 shadow-2xl backdrop-blur-md">
            <div className="flex items-center mb-4">
              <div className="mr-3"><GridoLogo /></div>
              <h3 className="text-xl font-bold text-blue-700">{editingPedido ? "Editar Pedido" : "Nuevo Pedido"}</h3>
            </div>
            {/* Solo formulario clásico para pedidos simples */}
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
              <div className="grid grid-cols-2 gap-4">
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
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                    value={formData.Descripcion}
                    onChange={e => setFormData({ ...formData, Descripcion: e.target.value })}
                  />
                </div>
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

      {/* Modal de Carga Rápida */}
      {isCargaRapidaOpen && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 rounded-2xl max-w-4xl w-full p-8 border-4 border-blue-200 shadow-2xl backdrop-blur-md">
            <div className="flex items-center mb-4">
              <div className="mr-3"><GridoLogo /></div>
              <h3 className="text-xl font-bold text-blue-700">Carga rápida de Pedidos (Helados, Impulsivos, Insumos)</h3>
            </div>
            {cargaRapidaLoading ? (
              <div className="text-center py-8 text-blue-500 font-bold">Cargando productos...</div>
            ) : (
              <CargaRapidaTabs
                helados={cargaRapidaHelados}
                setHelados={setCargaRapidaHelados}
                impulsivos={cargaRapidaImpulsivos}
                setImpulsivos={setCargaRapidaImpulsivos}
                insumos={cargaRapidaInsumos}
                setInsumos={setCargaRapidaInsumos}
              />
            )}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCargaRapidaOpen(false)}
                className="flex-1 bg-blue-100 text-blue-900 py-2 px-4 rounded-lg hover:bg-blue-200 font-bold shadow"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={cargaRapidaLoading}
                onClick={async () => {
                  // Guardar pedido batch
                  const productosSeleccionados = [
                    ...cargaRapidaHelados.filter(h => Number(h.cantidad) > 0),
                    ...cargaRapidaImpulsivos.filter(i => Number(i.cantidad) > 0),
                    ...cargaRapidaInsumos.filter(ins => Number(ins.cantidad) > 0),
                  ]
                  if (productosSeleccionados.length === 0) {
                    alert('Debes ingresar al menos una cantidad para guardar el pedido.')
                    return
                  }
                  // Construir campos para el pedido
                  const productosStr = productosSeleccionados.map(p => `${p.nombre || p.descripcion} (x${p.cantidad})`).join(", ")
                  const cantidadTotal = productosSeleccionados.reduce((acc, p) => acc + Number(p.cantidad), 0)
                  const precioTotal = productosSeleccionados.reduce((acc, p) => acc + (Number(p.precio) * Number(p.cantidad)), 0)
                  const pedidoData = {
                    GrupoProducto: "Batch",
                    Codigo: "-",
                    Cantidad: cantidadTotal,
                    Deposito: "-",
                    Descripcion: productosStr,
                    Cubicaje: "-",
                    Peso: "-",
                    impuestoIva: "-",
                    precio: precioTotal,
                    Disponible: "-",
                    maximo: "-",
                    minimo: "-",
                    multiplo: "-",
                    objetivo: "-",
                    cumplimiento: "-",
                    ObjetivoDisponible: "-",
                    restoMesAnterior: "-",
                    cuota: "-",
                    cliente_nombre: user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1),
                    cliente_telefono: "-",
                    cliente_direccion: "-",
                    productos: productosStr,
                    cantidad_total: cantidadTotal,
                    precio_total: precioTotal,
                    estado: "pendiente",
                    fecha_entrega: "",
                    observaciones: "Pedido generado por carga rápida",
                  }
                  setCargaRapidaLoading(true)
                  try {
                    const response = await pedidosAPI.create(pedidoData)
                    setPedidos([response.data.data, ...pedidos])
                    await registrarCambio({
                      email: user.email,
                      accion: "Crear",
                      entidad: "Pedido",
                      detalle: `Creó un pedido por carga rápida con ${productosSeleccionados.length} productos`,
                    })
                    if (refreshHistorial) refreshHistorial()
                    setIsCargaRapidaOpen(false)
                  } catch (e) {
                    alert('Error al guardar el pedido')
                  } finally {
                    setCargaRapidaLoading(false)
                  }
                }}
                className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-red-400 font-bold shadow disabled:opacity-50"
              >
                Guardar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición Rápida */}
      {isEditarRapidoOpen && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 rounded-2xl max-w-4xl w-full p-8 border-4 border-blue-200 shadow-2xl backdrop-blur-md">
            <div className="flex items-center mb-4">
              <div className="mr-3"><GridoLogo /></div>
              <h3 className="text-xl font-bold text-blue-700">Editar Pedido (Carga rápida)</h3>
            </div>
            {editarRapidoLoading ? (
              <div className="text-center py-8 text-blue-500 font-bold">Cargando productos...</div>
            ) : (
              <>
                <CargaRapidaTabsEditar
                  helados={editarRapidoHelados}
                  setHelados={setEditarRapidoHelados}
                  impulsivos={editarRapidoImpulsivos}
                  setImpulsivos={setEditarRapidoImpulsivos}
                  insumos={editarRapidoInsumos}
                  setInsumos={setEditarRapidoInsumos}
                />
                <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
                  <label className="font-bold text-blue-700">Estado:</label>
                  <select
                    className="p-2 border border-blue-200 rounded-lg"
                    value={editarRapidoEstado}
                    onChange={e => setEditarRapidoEstado(e.target.value)}
                  >
                    {estados.map(est => (
                      <option key={est} value={est}>{est.replace("_", " ")}</option>
                    ))}
                  </select>
                  <label className="font-bold text-blue-700 ml-4">Nombre del Pedido:</label>
                  <input
                    type="text"
                    className="p-2 border border-blue-200 rounded-lg"
                    value={editarRapidoPedido?.cliente_nombre || ''}
                    onChange={e => setEditarRapidoPedido({ ...editarRapidoPedido, cliente_nombre: e.target.value })}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditarRapidoOpen(false)}
                    className="flex-1 bg-blue-100 text-blue-900 py-2 px-4 rounded-lg hover:bg-blue-200 font-bold shadow"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={editarRapidoLoading}
                    onClick={async () => {
                      const productosSeleccionados = [
                        ...editarRapidoHelados.filter(h => Number(h.cantidad) > 0),
                        ...editarRapidoImpulsivos.filter(i => Number(i.cantidad) > 0),
                        ...editarRapidoInsumos.filter(ins => Number(ins.cantidad) > 0),
                      ]
                      if (productosSeleccionados.length === 0) {
                        alert('Debes ingresar al menos una cantidad para guardar el pedido.')
                        return
                      }
                      const productosStr = productosSeleccionados.map(p => `${p.nombre || p.descripcion} (x${p.cantidad})`).join(", ")
                      const cantidadTotal = productosSeleccionados.reduce((acc, p) => acc + Number(p.cantidad), 0)
                      const precioTotal = productosSeleccionados.reduce((acc, p) => acc + (Number(p.precio) * Number(p.cantidad)), 0)
                      const pedidoData = {
                        ...editarRapidoPedido,
                        productos: productosStr,
                        cantidad_total: cantidadTotal,
                        precio_total: precioTotal,
                        estado: editarRapidoEstado,
                        cliente_nombre: editarRapidoPedido?.cliente_nombre || '',
                      }
                      setEditarRapidoLoading(true)
                      try {
                        const response = await pedidosAPI.update(editarRapidoPedido.id, pedidoData)
                        setPedidos(pedidos.map((p) => (p.id === editarRapidoPedido.id ? response.data.data : p)))
                        await registrarCambio({
                          email: user.email,
                          accion: "Editar",
                          entidad: "Pedido",
                          detalle: `Editó (carga rápida) el pedido con id: ${editarRapidoPedido.id}`,
                        })
                        if (refreshHistorial) refreshHistorial()
                        setIsEditarRapidoOpen(false)
                      } catch (e) {
                        alert('Error al guardar el pedido')
                      } finally {
                        setEditarRapidoLoading(false)
                      }
                    }}
                    className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-red-400 font-bold shadow disabled:opacity-50"
                  >
                    Guardar cambios
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PedidosManager

// Componente de tabs y tablas editables para carga rápida
const CargaRapidaTabs = ({ helados, setHelados, impulsivos, setImpulsivos, insumos, setInsumos }) => {
  const [tab, setTab] = useState("helados")
  return (
    <div>
      <div className="flex space-x-2 mb-4 justify-center">
        <button
          className={`px-4 py-2 rounded-t-lg font-bold ${tab === "helados" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
          onClick={() => setTab("helados")}
        >Helados</button>
        <button
          className={`px-4 py-2 rounded-t-lg font-bold ${tab === "impulsivos" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
          onClick={() => setTab("impulsivos")}
        >Impulsivos</button>
        <button
          className={`px-4 py-2 rounded-t-lg font-bold ${tab === "insumos" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
          onClick={() => setTab("insumos")}
        >Insumos</button>
      </div>
      <div>
        {tab === "helados" && (
          <EditableTable
            productos={helados}
            setProductos={setHelados}
            tipo="helado"
          />
        )}
        {tab === "impulsivos" && (
          <EditableTable
            productos={impulsivos}
            setProductos={setImpulsivos}
            tipo="impulsivo"
          />
        )}
        {tab === "insumos" && (
          <EditableTable
            productos={insumos}
            setProductos={setInsumos}
            tipo="insumo"
          />
        )}
      </div>
    </div>
  )
}

// Tabla editable para productos
const EditableTable = ({ productos, setProductos, tipo }) => {
  return (
    <div className="overflow-x-auto max-h-72 mb-2">
      <table className="min-w-full bg-white border border-blue-100 rounded-2xl text-xs">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-2 py-2 text-left font-bold text-blue-700">Nombre</th>
            <th className="px-2 py-2 text-left font-bold text-blue-700">Cantidad</th>
            <th className="px-2 py-2 text-left font-bold text-blue-700">Precio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-50">
          {productos.map((p, idx) => (
            <tr key={p.id || idx} className={idx % 2 === 0 ? "bg-blue-50/40" : "bg-white"}>
              <td className="px-2 py-1 font-semibold text-blue-900">{p.nombre || p.descripcion}</td>
              <td className="px-2 py-1">
                <input
                  type="number"
                  min="0"
                  className="w-16 p-1 border border-blue-200 rounded"
                  value={p.cantidad}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setProductos(productos.map((item, i) => i === idx ? { ...item, cantidad: val } : item))
                  }}
                />
              </td>
              <td className="px-2 py-1">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-20 p-1 border border-blue-200 rounded"
                  value={p.precio}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.]/g, '')
                    setProductos(productos.map((item, i) => i === idx ? { ...item, precio: val } : item))
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Nuevo: Tabs de edición rápida solo con productos agregados y opción de agregar/eliminar
const EditarRapidoTabs = ({ helados, setHelados, impulsivos, setImpulsivos, insumos, setInsumos }) => {
  const [tab, setTab] = useState("helados")
  // Usar el catálogo importado
  const heladosCatalogoAll = heladosCatalogo
  // Para impulsivos e insumos, si necesitas catálogos completos, pásalos como props desde el componente principal
  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setTab("helados")} className={`px-4 py-2 rounded-full font-bold ${tab === "helados" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-700"}`}>Helados</button>
        <button onClick={() => setTab("impulsivos")} className={`px-4 py-2 rounded-full font-bold ${tab === "impulsivos" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-700"}`}>Impulsivos</button>
        <button onClick={() => setTab("insumos")} className={`px-4 py-2 rounded-full font-bold ${tab === "insumos" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-700"}`}>Insumos</button>
      </div>
      {tab === "helados" && (
        <EditableTableSoloAgregados
          productos={helados}
          setProductos={setHelados}
          tipo="helado"
          catalogo={heladosCatalogo}
        />
      )}
      {tab === "impulsivos" && (
        <EditableTableSoloAgregados
          productos={impulsivos}
          setProductos={setImpulsivos}
          tipo="impulsivo"
          catalogo={impulsivosCatalogo}
        />
      )}
      {tab === "insumos" && (
        <EditableTableSoloAgregados
          productos={insumos}
          setProductos={setInsumos}
          tipo="insumo"
          catalogo={insumosCatalogo}
        />
      )}
    </div>
  )
}

// Tabla editable solo con productos agregados, permite agregar/eliminar
const EditableTableSoloAgregados = ({ productos, setProductos, tipo, catalogo }) => {
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState("")
  // Productos que aún no están agregados
  const productosNoAgregados = catalogo.filter(p => !productos.some(pr => (pr.nombre || pr.descripcion) === (p.nombre || p.descripcion)))
  return (
    <div className="mb-4">
      <table className="min-w-full bg-white border border-blue-100 rounded-2xl mb-2">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Nombre</th>
            <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Cantidad</th>
            <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Precio</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {productos.filter(p => Number(p.cantidad) > 0 || p.cantidad === '' || p.cantidad === 0).map((p, idx) => (
            <tr key={p.nombre || p.descripcion}>
              <td className="px-4 py-2 font-semibold text-blue-900">{p.nombre || p.descripcion}</td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  min="0"
                  className="w-20 p-1 border border-blue-200 rounded"
                  value={p.cantidad}
                  onChange={e => {
                    const val = e.target.value
                    setProductos(productos.map((pr, i) => i === idx ? { ...pr, cantidad: val } : pr))
                  }}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  min="0"
                  className="w-24 p-1 border border-blue-200 rounded"
                  value={p.precio}
                  onChange={e => {
                    const val = e.target.value
                    setProductos(productos.map((pr, i) => i === idx ? { ...pr, precio: val } : pr))
                  }}
                />
              </td>
              <td className="px-4 py-2">
                <button
                  className="text-red-500 font-bold hover:text-blue-700"
                  onClick={() => setProductos(productos.filter((_, i) => i !== idx))}
                  title="Eliminar producto"
                >Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAdd ? (
        <div className="flex items-center space-x-2 mb-2">
          <select
            className="p-2 border border-blue-200 rounded"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            <option value="">Seleccionar producto</option>
            {productosNoAgregados.map(p => (
              <option key={p.nombre || p.descripcion} value={p.nombre || p.descripcion}>{p.nombre || p.descripcion}</option>
            ))}
          </select>
          <button
            className="bg-blue-700 text-white px-3 py-1 rounded font-bold"
            onClick={() => {
              if (!selected) return
              const prod = catalogo.find(p => (p.nombre || p.descripcion) === selected)
              setProductos([...productos, { ...prod, cantidad: 1, precio: prod.precio || 0 }])
              setSelected("")
              setShowAdd(false)
            }}
          >Agregar</button>
          <button className="text-blue-700 ml-2" onClick={() => setShowAdd(false)}>Cancelar</button>
        </div>
      ) : (
        <button
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold mt-2"
          onClick={() => setShowAdd(true)}
          disabled={productosNoAgregados.length === 0}
        >Agregar producto</button>
      )}
    </div>
  )
}

// Nueva función para exportar un solo pedido a Excel
const exportSinglePedidoExcel = async (pedido) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Pedido")
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
  // Igual que en exportToExcel, una fila por producto
  let productos = []
  if (pedido.productos && pedido.productos.includes(",")) {
    productos = pedido.productos.split(",").map(p => p.trim())
  } else if (pedido.productos) {
    productos = [pedido.productos]
  }
  if (productos.length > 1) {
    productos.forEach((prod) => {
      const match = prod.match(/(.+) \(x(\d+)\)/)
      worksheet.addRow({
        GrupoProducto: pedido.GrupoProducto || "-",
        Codigo: pedido.Codigo || "-",
        Cantidad: match ? match[2] : pedido.Cantidad || 1,
        Deposito: pedido.Deposito || "-",
        Descripcion: match ? match[1] : prod,
        Cubicaje: pedido.Cubicaje || "-",
        Peso: pedido.Peso || "-",
        impuestoIva: pedido.impuestoIva || "-",
        precio: pedido.precio || pedido.precio_total || "-",
        Disponible: pedido.Disponible || "-",
        maximo: pedido.maximo || "-",
        minimo: pedido.minimo || "-",
        multiplo: pedido.multiplo || "-",
        objetivo: pedido.objetivo || "-",
        cumplimiento: pedido.cumplimiento || "-",
        ObjetivoDisponible: pedido.ObjetivoDisponible || "-",
        restoMesAnterior: pedido.restoMesAnterior || "-",
        cuota: pedido.cuota || "-",
      })
    })
  } else {
    worksheet.addRow({
      GrupoProducto: pedido.GrupoProducto || "-",
      Codigo: pedido.Codigo || "-",
      Cantidad: pedido.Cantidad || pedido.cantidad_total || 1,
      Deposito: pedido.Deposito || "-",
      Descripcion: pedido.productos || "-",
      Cubicaje: pedido.Cubicaje || "-",
      Peso: pedido.Peso || "-",
      impuestoIva: pedido.impuestoIva || "-",
      precio: pedido.precio || pedido.precio_total || "-",
      Disponible: pedido.Disponible || "-",
      maximo: pedido.maximo || "-",
      minimo: pedido.minimo || "-",
      multiplo: pedido.multiplo || "-",
      objetivo: pedido.objetivo || "-",
      cumplimiento: pedido.cumplimiento || "-",
      ObjetivoDisponible: pedido.ObjetivoDisponible || "-",
      restoMesAnterior: pedido.restoMesAnterior || "-",
      cuota: pedido.cuota || "-",
    })
  }
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `pedido_grido_${pedido.id}.xlsx`)
}

// Componente de tabs y tablas editables para edición rápida (solo productos agregados)
const CargaRapidaTabsEditar = ({ helados, setHelados, impulsivos, setImpulsivos, insumos, setInsumos }) => {
  const [tab, setTab] = useState("helados")
  // Usar el catálogo importado
  const heladosCatalogoAll = heladosCatalogo
  // Función para agregar un helado del catálogo
  const agregarHelado = (nombre) => {
    if (!helados.some(h => h.nombre === nombre)) {
      const hCat = heladosCatalogo.find(h => h.nombre === nombre)
      setHelados([...helados, { ...hCat, cantidad: 1, precio: hCat.precio || '' }])
    }
  }
  // Función para eliminar un helado
  const eliminarHelado = (nombre) => {
    setHelados(helados.filter(h => h.nombre !== nombre))
  }
  // Similar para impulsivos e insumos
  // ...puedes agregar lógica similar para impulsivos e insumos si tienes catálogos...
  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setTab("helados")} className={`px-4 py-2 rounded-full font-bold ${tab === "helados" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>Helados</button>
        <button onClick={() => setTab("impulsivos")} className={`px-4 py-2 rounded-full font-bold ${tab === "impulsivos" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>Impulsivos</button>
        <button onClick={() => setTab("insumos")} className={`px-4 py-2 rounded-full font-bold ${tab === "insumos" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>Insumos</button>
      </div>
      {tab === "helados" && (
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {heladosCatalogo.filter(h => !helados.some(he => he.nombre === h.nombre)).map(h => (
              <button key={h.nombre} onClick={() => agregarHelado(h.nombre)} className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">+ {h.nombre}</button>
            ))}
          </div>
          <EditableTableEditar productos={helados} setProductos={setHelados} tipo="helado" eliminarProducto={eliminarHelado} />
        </div>
      )}
      {tab === "impulsivos" && (
        <EditableTableEditar productos={impulsivos.filter(i => Number(i.cantidad) > 0)} setProductos={setImpulsivos} tipo="impulsivo" />
      )}
      {tab === "insumos" && (
        <EditableTableEditar productos={insumos.filter(ins => Number(ins.cantidad) > 0)} setProductos={setInsumos} tipo="insumo" />
      )}
    </div>
  )
}

// Tabla editable para productos en edición rápida
const EditableTableEditar = ({ productos, setProductos, tipo, eliminarProducto }) => {
  const handleCantidadChange = (idx, value) => {
    const nuevos = [...productos]
    nuevos[idx].cantidad = value
    setProductos(nuevos)
  }
  const handlePrecioChange = (idx, value) => {
    const nuevos = [...productos]
    nuevos[idx].precio = value
    setProductos(nuevos)
  }
  return (
    <table className="min-w-full bg-white border border-blue-100 rounded-2xl mb-4">
      <thead className="bg-blue-50">
        <tr>
          <th className="px-2 py-2 text-xs font-bold text-blue-700">Nombre</th>
          <th className="px-2 py-2 text-xs font-bold text-blue-700">Cantidad</th>
          <th className="px-2 py-2 text-xs font-bold text-blue-700">Precio</th>
          {eliminarProducto && <th className="px-2 py-2 text-xs font-bold text-blue-700">Eliminar</th>}
        </tr>
      </thead>
      <tbody>
        {productos.map((p, idx) => (
          <tr key={p.nombre || p.descripcion}>
            <td className="px-2 py-1 text-blue-900 font-semibold">{p.nombre || p.descripcion}</td>
            <td className="px-2 py-1">
              <input
                type="number"
                min="0"
                className="w-16 p-1 border border-blue-200 rounded"
                value={p.cantidad}
                onChange={e => handleCantidadChange(idx, e.target.value)}
              />
            </td>
            <td className="px-2 py-1">
              <input
                type="number"
                min="0"
                className="w-20 p-1 border border-blue-200 rounded"
                value={p.precio}
                onChange={e => handlePrecioChange(idx, e.target.value)}
              />
            </td>
            {eliminarProducto && (
              <td className="px-2 py-1">
                <button onClick={() => eliminarProducto(p.nombre)} className="text-red-500 font-bold">Eliminar</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
