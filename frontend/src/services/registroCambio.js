import { supabase } from "./supabase"

export async function registrarCambio({ email, accion, entidad, detalle }) {
  console.log("Intentando registrar cambio:", { email, accion, entidad, detalle })
  const { data, error } = await supabase.from("cambios_empleados").insert([
    {
      email,
      accion,
      entidad,
      detalle,
      fecha: new Date().toISOString(),
    },
  ])
  if (error) {
    console.error("Error al registrar cambio:", error)
  } else {
    console.log("Cambio registrado:", data)
  }
  return { data, error }
}
