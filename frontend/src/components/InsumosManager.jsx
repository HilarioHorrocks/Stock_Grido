"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Minus, AlertTriangle } from "lucide-react"
import { insumosAPI } from "../services/api"

const InsumosManager = ({ insumos, setInsumos }) => {
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
      } else {
        const response = await insumosAPI.create(formData)
        setInsumos([...insumos, response.data.data])
      }
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
        await insumosAPI.delete(id)
        setInsumos(insumos.filter((i) => i.id !== id))
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Insumos</h2>
          <p className="text-gray-600">Administra el inventario de materias primas y suministros</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Agregar Insumo</span>
        </button>
      </div>

      {/* Tabla de Insumos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Mín.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {insumos.map((insumo) => {
              const stockBajo = insumo.stock <= insumo.stockMinimo
              return (
                <tr key={insumo.id} className={stockBajo ? "bg-red-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{insumo.nombre}</div>
                    <div className="text-sm text-gray-500">{insumo.unidad}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{insumo.proveedor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateStock(insumo.id, insumo.stock - 1)}
                        disabled={insumo.stock <= 0}
                        className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`min-w-[3rem] text-center ${stockBajo ? "text-red-600 font-bold" : ""}`}>
                        {insumo.stock}
                      </span>
                      <button
                        onClick={() => updateStock(insumo.id, insumo.stock + 1)}
                        className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {insumo.stockMinimo} {insumo.unidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">${insumo.precio || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {stockBajo ? (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Bajo</span>
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm font-medium">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(insumo)} className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(insumo.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {insumos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay insumos registrados. ¡Agrega el primer insumo!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{editingInsumo ? "Editar Insumo" : "Agregar Nuevo Insumo"}</h3>
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
                <button type="button" onClick={resetForm} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
                  {loading ? "Guardando..." : editingInsumo ? "Actualizar" : "Agregar"}
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
