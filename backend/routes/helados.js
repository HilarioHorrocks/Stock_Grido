import express from "express"

const router = express.Router()

// Base de datos en memoria (en producción usar una DB real como MongoDB, PostgreSQL, etc.)
const helados = [
  { id: 1, nombre: "Vainilla", stock: 25, precio: 150, categoria: "Clásico", fechaCreacion: new Date().toISOString() },
  { id: 2, nombre: "Chocolate", stock: 30, precio: 150, categoria: "Clásico", fechaCreacion: new Date().toISOString() },
  { id: 3, nombre: "Fresa", stock: 15, precio: 160, categoria: "Frutal", fechaCreacion: new Date().toISOString() },
  {
    id: 4,
    nombre: "Dulce de Leche",
    stock: 20,
    precio: 170,
    categoria: "Especial",
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 5,
    nombre: "Menta Granizada",
    stock: 8,
    precio: 180,
    categoria: "Especial",
    fechaCreacion: new Date().toISOString(),
  },
]

// GET - Obtener todos los helados
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      data: helados,
      total: helados.length,
    })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener helados" })
  }
})

// GET - Obtener helado por ID
router.get("/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const helado = helados.find((h) => h.id === id)

    if (!helado) {
      return res.status(404).json({ message: "Helado no encontrado" })
    }

    res.json({ success: true, data: helado })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener helado" })
  }
})

// POST - Crear nuevo helado
router.post("/", (req, res) => {
  try {
    const { nombre, stock, precio, categoria } = req.body

    // Validaciones
    if (!nombre || stock === undefined || precio === undefined || !categoria) {
      return res.status(400).json({ message: "Todos los campos son requeridos" })
    }

    if (stock < 0 || precio < 0) {
      return res.status(400).json({ message: "Stock y precio deben ser números positivos" })
    }

    const newHelado = {
      id: Math.max(...helados.map((h) => h.id), 0) + 1,
      nombre: nombre.trim(),
      stock: Number(stock),
      precio: Number(precio),
      categoria: categoria.trim(),
      fechaCreacion: new Date().toISOString(),
    }

    helados.push(newHelado)
    res.status(201).json({ success: true, data: newHelado })
  } catch (error) {
    res.status(500).json({ message: "Error al crear helado" })
  }
})

// PUT - Actualizar helado completo
router.put("/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const { nombre, stock, precio, categoria } = req.body

    const index = helados.findIndex((h) => h.id === id)
    if (index === -1) {
      return res.status(404).json({ message: "Helado no encontrado" })
    }

    // Validaciones
    if (!nombre || stock === undefined || precio === undefined || !categoria) {
      return res.status(400).json({ message: "Todos los campos son requeridos" })
    }

    if (stock < 0 || precio < 0) {
      return res.status(400).json({ message: "Stock y precio deben ser números positivos" })
    }

    helados[index] = {
      ...helados[index],
      nombre: nombre.trim(),
      stock: Number(stock),
      precio: Number(precio),
      categoria: categoria.trim(),
      fechaActualizacion: new Date().toISOString(),
    }

    res.json({ success: true, data: helados[index] })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar helado" })
  }
})

// DELETE - Eliminar helado
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const index = helados.findIndex((h) => h.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Helado no encontrado" })
    }

    const deletedHelado = helados.splice(index, 1)[0]
    res.json({ success: true, message: "Helado eliminado", data: deletedHelado })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar helado" })
  }
})

// PATCH - Actualizar solo el stock
router.patch("/:id/stock", (req, res) => {
  try {
    const id = Number(req.params.id)
    const { stock } = req.body

    const index = helados.findIndex((h) => h.id === id)
    if (index === -1) {
      return res.status(404).json({ message: "Helado no encontrado" })
    }

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Stock debe ser un número positivo" })
    }

    helados[index].stock = Number(stock)
    helados[index].fechaActualizacion = new Date().toISOString()

    res.json({ success: true, data: helados[index] })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar stock" })
  }
})

export default router
