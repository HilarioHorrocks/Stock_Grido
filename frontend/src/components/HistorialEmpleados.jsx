import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

const GridoLogo = () => (
  <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="32" rx="28" ry="28" fill="#1B4DB1" stroke="#E53935" strokeWidth="4"/>
    <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="bold" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" dy=".3em">G</text>
  </svg>
)

const HistorialEmpleados = ({ refresh }) => {
  const [cambios, setCambios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCambios = async () => {
      setLoading(true)
      setError("")
      // Suponiendo que tienes una tabla 'cambios_empleados' en Supabase con los campos: id, email, accion, entidad, detalle, fecha
      const { data, error } = await supabase
        .from("cambios_empleados")
        .select("id, email, accion, entidad, detalle, fecha")
        .order("fecha", { ascending: false })
      if (error) setError("Error al cargar historial: " + error.message)
      setCambios(data || [])
      setLoading(false)
    }
    fetchCambios()
  }, [refresh])

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100 max-w-4xl mx-auto mt-10">
      <div className="flex items-center mb-8 space-x-4">
        <div className="backdrop-blur-md bg-white/60 rounded-full p-2 border-4 border-blue-200 shadow-lg">
          <GridoLogo />
        </div>
        <h2 className="text-2xl font-extrabold text-blue-800 drop-shadow tracking-wide">Historial de Cambios por Empleado</h2>
      </div>
      {loading ? (
        <div className="text-blue-500 font-bold">Cargando historial...</div>
      ) : error ? (
        <div className="text-red-500 font-bold">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="min-w-full bg-white border border-blue-100 rounded-2xl">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Empleado (Email)</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Acción</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Entidad</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {cambios.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 text-blue-700">{new Date(c.fecha).toLocaleString()}</td>
                  <td className="px-4 py-2 font-bold text-blue-900">{c.email}</td>
                  <td className="px-4 py-2 text-blue-700">{c.accion}</td>
                  <td className="px-4 py-2 text-blue-700">{c.entidad}</td>
                  <td className="px-4 py-2 text-blue-700">{c.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {cambios.length === 0 && (
            <div className="text-blue-400 text-center py-8 font-semibold">No hay cambios registrados aún.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default HistorialEmpleados
