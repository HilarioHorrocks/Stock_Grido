import { useEffect, useState } from "react";
import { impulsivosAPI } from "../services/api";
import { registrarCambio } from "../services/registroCambio";

// Logo SVG Grido
const GridoLogo = () => {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="32" rx="28" ry="28" fill="#1B4DB1" stroke="#E53935" strokeWidth="4"/>
      <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="bold" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" dy=".3em">G</text>
    </svg>
  )
}

const ImpulsivosManager = ({ user, refreshHistorial }) => {
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
        await registrarCambio({
          email: user.email,
          accion: "Editar",
          entidad: "Impulsivo",
          detalle: `Editó el impulsivo: ${form.nombre}`,
        });
      } else {
        await impulsivosAPI.create(form);
        await registrarCambio({
          email: user.email,
          accion: "Crear",
          entidad: "Impulsivo",
          detalle: `Creó el impulsivo: ${form.nombre}`,
        });
      }
      if (refreshHistorial) refreshHistorial();
      fetchImpulsivos();
      setForm({ nombre: "", stock: "", precio: "", categoria: "" });
      setEditId(null);
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
        await registrarCambio({
          email: user.email,
          accion: "Eliminar",
          entidad: "Impulsivo",
          detalle: `Eliminó el impulsivo con id: ${id}`,
        });
        if (refreshHistorial) refreshHistorial();
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
    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
      <div className="flex items-center mb-8 space-x-4">
        <div className="backdrop-blur-md bg-white/60 rounded-full p-2 border-4 border-blue-200 shadow-lg">
          <GridoLogo />
        </div>
        <h2 className="text-2xl font-extrabold text-blue-800 drop-shadow tracking-wide">Gestión de Impulsivos</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-8 bg-white/80 rounded-2xl p-6 shadow border border-blue-50">
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          className="col-span-2 rounded-lg border-2 border-blue-100 bg-blue-50 text-blue-900 font-semibold placeholder-blue-300 py-2 px-3"
          required
        />
        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="rounded-lg border-2 border-blue-100 bg-blue-50 text-blue-900 font-semibold placeholder-blue-300 py-2 px-3"
          required
        />
        <input
          type="number"
          name="precio"
          value={form.precio}
          onChange={handleChange}
          placeholder="Precio"
          className="rounded-lg border-2 border-blue-100 bg-blue-50 text-blue-900 font-semibold placeholder-blue-300 py-2 px-3"
          required
        />
        <input
          type="text"
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          placeholder="Categoría"
          className="rounded-lg border-2 border-blue-100 bg-blue-50 text-blue-900 font-semibold placeholder-blue-300 py-2 px-3"
          required
        />
        <button
          type="submit"
          className="col-span-2 bg-gradient-to-r from-blue-500 to-red-400 hover:from-red-400 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-full border-2 border-blue-200 hover:border-red-400 shadow-lg transition-all backdrop-blur-md"
        >
          {editId ? "Actualizar" : "Agregar"}
        </button>
      </form>
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
            {impulsivos.map((impulsivo, idx) => (
              <tr key={impulsivo.id} className={idx % 2 === 0 ? "bg-blue-50/40" : "bg-white"}>
                <td className="px-6 py-4 font-bold text-blue-900">{impulsivo.nombre}</td>
                <td className="px-6 py-4 text-blue-700">{impulsivo.stock}</td>
                <td className="px-6 py-4 text-blue-700">${impulsivo.precio}</td>
                <td className="px-6 py-4 text-blue-700">{impulsivo.categoria}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => handleEdit(impulsivo)} className="text-blue-500 hover:text-red-400 font-bold">Editar</button>
                  <button onClick={() => handleDelete(impulsivo.id)} className="text-red-500 hover:text-blue-700 font-bold">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImpulsivosManager;
