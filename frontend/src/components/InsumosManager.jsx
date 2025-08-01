"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Minus, AlertTriangle } from "lucide-react"
import { insumosAPI } from "../services/api"
import { registrarCambio } from "../services/registroCambio"

// Logo SVG Grido
const GridoLogo = () => {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="32" rx="28" ry="28" fill="#1B4DB1" stroke="#E53935" strokeWidth="4"/>
      <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="bold" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" dy=".3em">G</text>
    </svg>
  )
}

const InsumosManager = ({ insumos, setInsumos, user, refreshHistorial }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    stock: "",
    unidad: "",
    proveedor: "",
    stockMinimo: "",
    precio: "",
  })
  const [loading, setLoading] = useState(false)

  const unidades = ["Kg", "Litros", "Unidades", "Gramos", "Cajas", "Paquetes"]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingInsumo) {
        const response = await insumosAPI.update(editingInsumo.id, formData)
        setInsumos(insumos.map((i) => (i.id === editingInsumo.id ? response.data.data : i)))
        await registrarCambio({
          email: user.email,
          accion: "Editar",
          entidad: "Insumo",
          detalle: `Editó el insumo: ${formData.nombre}`,
        })
      } else {
        const response = await insumosAPI.create(formData)
        setInsumos([...insumos, response.data.data])
        await registrarCambio({
          email: user.email,
          accion: "Crear",
          entidad: "Insumo",
          detalle: `Creó el insumo: ${formData.nombre}`,
        })
      }
      if (refreshHistorial) refreshHistorial()
      resetForm()
    } catch (error) {
      alert(error.response?.data?.message || "Error al guardar insumo")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      stock: "",
      unidad: "",
      proveedor: "",
      stockMinimo: "",
      precio: "",
    })
    setEditingInsumo(null)
    setIsModalOpen(false)
  }

  const handleEdit = (insumo) => {
    setEditingInsumo(insumo)
    setFormData({
      nombre: insumo.nombre,
      stock: insumo.stock.toString(),
      unidad: insumo.unidad,
      proveedor: insumo.proveedor,
      stockMinimo: insumo.stockMinimo.toString(),
      precio: (insumo.precio || "").toString(),
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este insumo?")) {
      try {
        setInsumos(insumos.filter((i) => i.id !== id))
        await registrarCambio({
          email: user.email,
          accion: "Eliminar",
          entidad: "Insumo",
          detalle: `Eliminó el insumo con id: ${id}`,
        })
        if (refreshHistorial) refreshHistorial()
      } catch (error) {
        alert(error.response?.data?.message || "Error al eliminar insumo")
      }
    }
  }

  const updateStock = async (id, newStock) => {
    try {
      const response = await insumosAPI.updateStock(id, newStock)
      setInsumos(insumos.map((i) => (i.id === id ? response.data.data : i)))
    } catch (error) {
      alert(error.response?.data?.message || "Error al actualizar stock")
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
      <div className="flex items-center mb-8 space-x-4">
        <div className="backdrop-blur-md bg-white/60 rounded-full p-2 border-4 border-blue-200 shadow-lg">
          <GridoLogo />
        </div>
        <h2 className="text-2xl font-extrabold text-blue-800 drop-shadow tracking-wide">Gestión de Insumos</h2>
      </div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-red-400 hover:from-red-400 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-full border-2 border-blue-200 hover:border-red-400 shadow-lg transition-all backdrop-blur-md"
        >
          <Plus className="w-5 h-5 inline mr-1" /> Nuevo Insumo
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-lg">
        <table className="min-w-full bg-white border border-blue-100 rounded-2xl">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Unidad</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Stock Mínimo</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {insumos.map((insumo, idx) => (
              <tr key={insumo.id} className={idx % 2 === 0 ? "bg-blue-50/40" : "bg-white"}>
                <td className="px-6 py-4 font-bold text-blue-900">{insumo.nombre}</td>
                <td className="px-6 py-4 text-blue-700">{insumo.stock}</td>
                <td className="px-6 py-4 text-blue-700">{insumo.unidad}</td>
                <td className="px-6 py-4 text-blue-700">{insumo.proveedor}</td>
                <td className="px-6 py-4 text-blue-700">{insumo.stockMinimo}</td>
                <td className="px-6 py-4 text-blue-700">${insumo.precio}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => handleEdit(insumo)} className="text-blue-500 hover:text-red-400 font-bold">Editar</button>
                  <button onClick={() => handleDelete(insumo.id)} className="text-red-500 hover:text-blue-700 font-bold">Eliminar</button>
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
              <h3 className="text-xl font-bold text-blue-700">{editingInsumo ? "Editar Insumo" : "Nuevo Insumo"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Insumo</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Ej: Leche Entera"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Ej: Lácteos del Valle SA"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <select
                    required
                    className="input-field"
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                  >
                    <option value="">Selecciona unidad</option>
                    {unidades.map((unidad) => (
                      <option key={unidad} value={unidad}>
                        {unidad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input-field"
                    placeholder="0"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Opcional)</label>
                  <input
                    type="number"
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
                  {loading ? "Guardando..." : editingInsumo ? "Actualizar" : "Crear Insumo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InsumosManager
