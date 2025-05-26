import express from "express"

const router = express.Router()

// Base de datos en memoria
const insumos = [
  {
    id: 1,
    nombre: "Leche",
    stock: 50,
    unidad: "Litros",
    proveedor: "Lácteos SA",
    stockMinimo: 10,
    precio: 120,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: "Azúcar",
    stock: 25,
    unidad: "Kg",
    proveedor: "Dulces Corp",
    stockMinimo: 5,
    precio: 80,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: "Huevos",
    stock: 100,
    unidad: "Unidades",
    proveedor: "Granja Feliz",
    stockMinimo: 20,
    precio: 5,
    fechaCreacion: new Date().toISOString(),
  },
  {
    id: 4,
    nombre: "Vainilla Esencia",
    stock: 3,
    unidad: "Litros",
    proveedor: "Esencias SA",
    stockMinimo: 2,
    precio: 250,
    fechaCreacion: new Date().toISOString(),
  },
]

// GET - Obtener todos los insumos
router.get("/", (req, res) => {
  try {
    // Agregar información de estado de stock
    const insumosConEstado = insumos.map((insumo) => ({
      ...insumo,
      stockBajo: insumo.stock <= insumo.stockMinimo,
      valorTotal: insumo.stock * (insumo.precio || 0),
    }))

    res.json({
      success: true,
      data: insumosConEstado,
      total: insumos.length,
      stockBajo: insumosConEstado.filter((i) => i.stockBajo).length,
    })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener insumos" })
  }
})

// GET - Obtener insumo por ID
router.get("/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const insumo = insumos.find((i) => i.id === id)

    if (!insumo) {
      return res.status(404).json({ message: "Insumo no encontrado" })
    }

    res.json({ success: true, data: insumo })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener insumo" })
  }
})

// POST - Crear nuevo insumo
router.post("/", (req, res) => {
  try {
    const { nombre, stock, unidad, proveedor, stockMinimo, precio } = req.body

    // Validaciones
    if (!nombre || stock === undefined || !unidad || !proveedor || stockMinimo === undefined) {
      return res.status(400).json({ message: "Todos los campos son requeridos" })
    }

    if (stock < 0 || stockMinimo < 0 || (precio && precio < 0)) {
      return res.status(400).json({ message: "Los valores numéricos deben ser positivos" })
    }

    const newInsumo = {
      id: Math.max(...insumos.map((i) => i.id), 0) + 1,
      nombre: nombre.trim(),
      stock: Number(stock),
      unidad: unidad.trim(),
      proveedor: proveedor.trim(),
      stockMinimo: Number(stockMinimo),
      precio: precio ? Number(precio) : 0,
      fechaCreacion: new Date().toISOString(),
    }

    insumos.push(newInsumo)
    res.status(201).json({ success: true, data: newInsumo })
  } catch (error) {
    res.status(500).json({ message: "Error al crear insumo" })
  }
})

// PUT - Actualizar insumo completo
router.put("/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const { nombre, stock, unidad, proveedor, stockMinimo, precio } = req.body

    const index = insumos.findIndex((i) => i.id === id)
    if (index === -1) {
      return res.status(404).json({ message: "Insumo no encontrado" })
    }

    // Validaciones
    if (!nombre || stock === undefined || !unidad || !proveedor || stockMinimo === undefined) {
      return res.status(400).json({ message: "Todos los campos son requeridos" })
    }

    if (stock < 0 || stockMinimo < 0 || (precio && precio < 0)) {
      return res.status(400).json({ message: "Los valores numéricos deben ser positivos" })
    }

    insumos[index] = {
      ...insumos[index],
      nombre: nombre.trim(),
      stock: Number(stock),
      unidad: unidad.trim(),
      proveedor: proveedor.trim(),
      stockMinimo: Number(stockMinimo),
      precio: precio ? Number(precio) : insumos[index].precio || 0,
      fechaActualizacion: new Date().toISOString(),
    }

    res.json({ success: true, data: insumos[index] })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar insumo" })
  }
})

// DELETE - Eliminar insumo
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const index = insumos.findIndex((i) => i.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Insumo no encontrado" })
    }

    const deletedInsumo = insumos.splice(index, 1)[0]
    res.json({ success: true, message: "Insumo eliminado", data: deletedInsumo })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar insumo" })
  }
})

// PATCH - Actualizar solo el stock
router.patch("/:id/stock", (req, res) => {
  try {
    const id = Number(req.params.id)
    const { stock } = req.body

    const index = insumos.findIndex((i) => i.id === id)
    if (index === -1) {
      return res.status(404).json({ message: "Insumo no encontrado" })
    }

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Stock debe ser un número positivo" })
    }

    insumos[index].stock = Number(stock)
    insumos[index].fechaActualizacion = new Date().toISOString()

    res.json({ success: true, data: insumos[index] })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar stock" })
  }
})

// GET - Obtener insumos con stock bajo
router.get("/alerts/stock-bajo", (req, res) => {
  try {
    const insumosStockBajo = insumos.filter((insumo) => insumo.stock <= insumo.stockMinimo)
    res.json({
      success: true,
      data: insumosStockBajo,
      total: insumosStockBajo.length,
    })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener alertas" })
  }
})

export default router
