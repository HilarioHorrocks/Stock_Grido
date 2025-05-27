import { useEffect, useState } from "react";
import { impulsivosAPI } from "../services/api";

const ImpulsivosManager = () => {
  const [impulsivos, setImpulsivos] = useState([]);
  const [form, setForm] = useState({ nombre: "", stock: "", precio: "", categoria: "" });
  const [editId, setEditId] = useState(null);

  const fetchImpulsivos = async () => {
    try {
      const response = await impulsivosAPI.getAll();
      setImpulsivos(response.data.data);
    } catch (error) {
      console.error("Error al cargar impulsivos", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await impulsivosAPI.update(editId, form);
      } else {
        await impulsivosAPI.create(form);
      }
      setForm({ nombre: "", stock: "", precio: "", categoria: "" });
      setEditId(null);
      fetchImpulsivos();
    } catch (error) {
      console.error("Error al guardar impulsivo", error);
    }
  };

  const handleEdit = (impulsivo) => {
    setForm({
      nombre: impulsivo.nombre,
      stock: impulsivo.stock,
      precio: impulsivo.precio,
      categoria: impulsivo.categoria,
    });
    setEditId(impulsivo.id);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar este producto impulsivo?")) {
      try {
        await impulsivosAPI.delete(id);
        fetchImpulsivos();
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  useEffect(() => {
    fetchImpulsivos();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Impulsivos</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          className="input-field col-span-2"
          required
        />
        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="input-field"
          required
        />
        <input
          type="number"
          name="precio"
          value={form.precio}
          onChange={handleChange}
          placeholder="Precio"
          className="input-field"
          required
        />
        <input
          type="text"
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          placeholder="Categoría"
          className="input-field col-span-2"
        />
        <button
          type="submit"
          className="btn-primary col-span-2"
        >
          {editId ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Stock</th>
            <th className="border px-4 py-2">Precio</th>
            <th className="border px-4 py-2">Categoría</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {impulsivos.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.nombre}</td>
              <td className="border px-4 py-2">{item.stock}</td>
              <td className="border px-4 py-2">${item.precio}</td>
              <td className="border px-4 py-2">{item.categoria}</td>
              <td className="border px-4 py-2 space-x-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline">Editar</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImpulsivosManager;
