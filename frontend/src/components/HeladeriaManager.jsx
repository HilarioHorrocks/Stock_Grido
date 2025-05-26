"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Minus } from "lucide-react"
import { heladosAPI } from "../services/api"

const HeladeriaManager = ({ helados, setHelados }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHelado, setEditingHelado] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    stock: "",
    precio: "",
    categoria: "",
  })
  const [loading, setLoading] = useState(false)

  const categorias = ["Clásico", "Frutal", "Especial", "Premium", "Sin Azúcar"]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingHelado) {
        const response = await heladosAPI.update(editingHelado.id, formData)
        setHelados(helados.map((h) => (h.id === editingHelado.id ? response.data.data : h)))
      } else {
        const response = await heladosAPI.create(formData)
        setHelados([...helados, response.data.data])
      }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Helados</h2>
          <p className="text-gray-600">Administra el inventario de sabores de helado</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Agregar Helado</span>
        </button>
      </div>

      {/* Tabla de Helados */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sabor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock (L)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio/L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {helados.map((helado) => (
              <tr key={helado.id} className={helado.stock <= 10 ? "bg-red-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{helado.nombre}</div>
                  {helado.stock <= 10 && <div className="text-xs text-red-600">⚠️ Stock bajo</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{helado.categoria}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateStock(helado.id, helado.stock - 1)}
                      disabled={helado.stock <= 0}
                      className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className={`min-w-[3rem] text-center ${helado.stock <= 10 ? "text-red-600 font-bold" : ""}`}>
                      {helado.stock}
                    </span>
                    <button
                      onClick={() => updateStock(helado.id, helado.stock + 1)}
                      className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">${helado.precio}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  ${(helado.stock * helado.precio).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => handleEdit(helado)} className="text-blue-600 hover:text-blue-900">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(helado.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {helados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay helados registrados. ¡Agrega el primer sabor!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{editingHelado ? "Editar Helado" : "Agregar Nuevo Helado"}</h3>
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
                <button type="button" onClick={resetForm} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
                  {loading ? "Guardando..." : editingHelado ? "Actualizar" : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeladeriaManager
