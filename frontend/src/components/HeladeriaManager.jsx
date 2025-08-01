"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Minus } from "lucide-react"
import { heladosAPI } from "../services/api"
import { registrarCambio } from "../services/registroCambio"

// Logo SVG Grido
const GridoLogo = () => {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www..org/2000/svg">
      <ellipse cx="32" cy="32" rx="28" ry="28" fill="#1B4DB1" stroke="#E53935" strokeWidth="4"/>
      <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="bold" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" dy=".3em">G</text>
    </svg>
  )
}

const heladosGrido = [
  // CREMAS
  { nombre: "Vainilla", categoria: "Clásico" },
  { nombre: "Granizado", categoria: "Clásico" },
  { nombre: "Crema Americana", categoria: "Clásico" },
  { nombre: "Crema Rusa", categoria: "Clásico" },
  { nombre: "Menta Granizada", categoria: "Clásico" },
  // CHOCOLATES
  { nombre: "Chocolate", categoria: "Chocolate" },
  { nombre: "Chocolate con Almendras", categoria: "Chocolate" },
  { nombre: "Chocolate Blanco", categoria: "Chocolate" },
  { nombre: "Chocolate Suizo", categoria: "Chocolate" },
  { nombre: "Chocolate Mani Crunch", categoria: "Chocolate" },
  { nombre: "Choco Blanco Oreo", categoria: "Chocolate" },
  // FRUTAS A LA CREMA
  { nombre: "Durazno a la Crema", categoria: "Frutal" },
  { nombre: "Ananá a la Crema", categoria: "Frutal" },
  { nombre: "Banana con Dulce de Leche", categoria: "Frutal" },
  { nombre: "Cereza", categoria: "Frutal" },
  { nombre: "Frutilla a la Crema", categoria: "Frutal" },
  { nombre: "Kinotos al Whisky", categoria: "Frutal" },
  // FRUTAS AL AGUA
  { nombre: "Limón", categoria: "Frutal" },
  { nombre: "Naranja", categoria: "Frutal" },
  { nombre: "Frutilla al agua", categoria: "Frutal" },
  { nombre: "Maracuyá", categoria: "Frutal" },
  { nombre: "Frutos Rojos", categoria: "Frutal" },
  // CREMAS ESPECIALES
  { nombre: "Crema Flan", categoria: "Especial" },
  { nombre: "Sambayón", categoria: "Especial" },
  { nombre: "Super Gridito", categoria: "Especial" },
  { nombre: "Tiramisú", categoria: "Especial" },
  { nombre: "Crema Cookie", categoria: "Especial" },
  { nombre: "Mascarpone con Frutos del Bosque", categoria: "Especial" },
  { nombre: "Tramontana", categoria: "Especial" },
  { nombre: "Grido Marroc", categoria: "Especial" },
  { nombre: "Cappuccino Granizado", categoria: "Especial" },
  // DULCE DE LECHE
  { nombre: "Dulce de Leche", categoria: "Dulce de Leche" },
  { nombre: "Dulce de Leche con Nuez", categoria: "Dulce de Leche" },
  { nombre: "Dulce de Leche Granizado", categoria: "Dulce de Leche" },
  { nombre: "Dulce de Leche con Brownie", categoria: "Dulce de Leche" },
  { nombre: "Super Dulce de Leche Grido", categoria: "Dulce de Leche" },
]

const HeladeriaManager = ({ helados, setHelados, user, refreshHistorial }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHelado, setEditingHelado] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    stock: "",
    precio: "",
    categoria: "",
  })
  const [loading, setLoading] = useState(false)
  const [isCargaRapidaOpen, setIsCargaRapidaOpen] = useState(false)
  const [cargaRapida, setCargaRapida] = useState(
    heladosGrido.map(h => ({ ...h, stock: "", precio: "" }))
  )

  const categorias = ["Clásico", "Frutal", "Especial", "Premium", "Sin Azúcar"]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingHelado) {
        const response = await heladosAPI.update(editingHelado.id, formData)
        setHelados(helados.map((h) => (h.id === editingHelado.id ? response.data.data : h)))
        await registrarCambio({
          email: user.email,
          accion: "Editar",
          entidad: "Helado",
          detalle: `Editó el helado: ${formData.nombre}`,
        })
      } else {
        const response = await heladosAPI.create(formData)
        setHelados([...helados, response.data.data])
        await registrarCambio({
          email: user.email,
          accion: "Crear",
          entidad: "Helado",
          detalle: `Creó el helado: ${formData.nombre}`,
        })
      }
      if (refreshHistorial) refreshHistorial()
      resetForm()
    } catch (error) {
      alert(error.response?.data?.message || "Error al guardar helado")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "", stock: "", precio: "", categoria: "" })
    setEditingHelado(null)
    setIsModalOpen(false)
  }

  const handleEdit = (helado) => {
    setEditingHelado(helado)
    setFormData({
      nombre: helado.nombre,
      stock: helado.stock.toString(),
      precio: helado.precio.toString(),
      categoria: helado.categoria,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este helado?")) {
      try {
        await heladosAPI.delete(id)
        setHelados(helados.filter((h) => h.id !== id))
        await registrarCambio({
          email: user.email,
          accion: "Eliminar",
          entidad: "Helado",
          detalle: `Eliminó el helado con id: ${id}`,
        })
        if (refreshHistorial) refreshHistorial()
      } catch (error) {
        alert(error.response?.data?.message || "Error al eliminar helado")
      }
    }
  }

  const updateStock = async (id, newStock) => {
    try {
      const response = await heladosAPI.updateStock(id, newStock)
      setHelados(helados.map((h) => (h.id === id ? response.data.data : h)))
    } catch (error) {
      alert(error.response?.data?.message || "Error al actualizar stock")
    }
  }

  // Carga rápida handler
  const handleCargaRapidaChange = (idx, field, value) => {
    setCargaRapida(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h))
  }

  const handleCargaRapidaGuardar = async () => {
    setLoading(true)
    try {
      const aCrear = cargaRapida.filter(h => h.stock && Number(h.stock) > 0)
      const nuevos = []
      for (const h of aCrear) {
        const response = await heladosAPI.create({
          nombre: h.nombre,
          stock: h.stock,
          precio: h.precio,
          categoria: h.categoria,
        })
        nuevos.push(response.data.data)
        await registrarCambio({
          email: user.email,
          accion: "Carga rápida",
          entidad: "Helado",
          detalle: `Carga rápida: ${h.nombre} (${h.stock}u, $${h.precio})`,
        })
      }
      setHelados([...helados, ...nuevos])
      if (refreshHistorial) refreshHistorial()
      setIsCargaRapidaOpen(false)
      setCargaRapida(heladosGrido.map(h => ({ ...h, stock: "", precio: "" })))
    } catch (error) {
      alert("Error en carga rápida: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
      <div className="flex items-center mb-8 space-x-4">
        <div className="backdrop-blur-md bg-white/60 rounded-full p-2 border-4 border-blue-200 shadow-lg">
          <GridoLogo />
        </div>
        <h2 className="text-2xl font-extrabold text-blue-800 drop-shadow tracking-wide">Gestión de Helados</h2>
      </div>
      <div className="flex justify-end mb-4 space-x-2">
        <button
          onClick={() => setIsCargaRapidaOpen(true)}
          className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white font-bold py-2 px-6 rounded-full border-2 border-blue-200 shadow-lg transition-all backdrop-blur-md"
        >
          <Plus className="w-5 h-5 inline mr-1" /> Carga rápida
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-red-400 hover:from-red-400 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-full border-2 border-blue-200 hover:border-red-400 shadow-lg transition-all backdrop-blur-md"
        >
          <Plus className="w-5 h-5 inline mr-1" /> Nuevo Helado
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-lg">
        <table className="min-w-full bg-white border border-blue-100 rounded-2xl">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {helados.map((helado, idx) => (
              <tr key={helado.id} className={idx % 2 === 0 ? "bg-blue-50/40" : "bg-white"}>
                <td className="px-6 py-4 font-bold text-blue-900">{helado.nombre}</td>
                <td className="px-6 py-4 text-blue-700">{helado.stock}</td>
                <td className="px-6 py-4 text-blue-700">${helado.precio}</td>
                <td className="px-6 py-4 text-blue-700">{helado.categoria}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => handleEdit(helado)} className="text-blue-500 hover:text-red-400 font-bold">Editar</button>
                  <button onClick={() => handleDelete(helado.id)} className="text-red-500 hover:text-blue-700 font-bold">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 rounded-2xl max-w-md w-full p-8 border-4 border-blue-200 shadow-2xl backdrop-blur-md">
            <div className="flex items-center mb-4">
              <div className="mr-3"><GridoLogo /></div>
              <h3 className="text-xl font-bold text-blue-700">{editingHelado ? "Editar Helado" : "Nuevo Helado"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Sabor</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Ej: Chocolate con Almendras"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  required
                  className="input-field"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock (Litros)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input-field"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Litro</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  />
                </div>
              </div>
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
                  {loading ? "Guardando..." : editingHelado ? "Actualizar" : "Crear Helado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Carga Rápida */}
      {isCargaRapidaOpen && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 rounded-2xl max-w-2xl w-full p-8 border-4 border-blue-200 shadow-2xl backdrop-blur-md">
            <div className="flex items-center mb-4">
              <div className="mr-3"><GridoLogo /></div>
              <h3 className="text-xl font-bold text-blue-700">Carga rápida de Helados Grido</h3>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full bg-white border border-blue-100 rounded-2xl text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-bold text-blue-700">Nombre</th>
                    <th className="px-2 py-2 text-left font-bold text-blue-700">Categoría</th>
                    <th className="px-2 py-2 text-left font-bold text-blue-700">Stock</th>
                    <th className="px-2 py-2 text-left font-bold text-blue-700">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {cargaRapida.map((h, idx) => (
                    <tr key={h.nombre}>
                      <td className="px-2 py-1 font-semibold text-blue-900">{h.nombre}</td>
                      <td className="px-2 py-1 text-blue-700">{h.categoria}</td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          className="input-field w-20"
                          value={h.stock}
                          onChange={e => handleCargaRapidaChange(idx, "stock", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input-field w-24"
                          value={h.precio}
                          onChange={e => handleCargaRapidaChange(idx, "precio", e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                onClick={handleCargaRapidaGuardar}
                disabled={loading}
                className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-red-400 font-bold shadow disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar todo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeladeriaManager
