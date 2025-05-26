import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import heladosRoutes from "./routes/helados.js"
import insumosRoutes from "./routes/insumos.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
// O simplemente permite cualquier origen:
app.use(
  cors({
    origin: true, // ← PERMITE CUALQUIER ORIGEN
    credentials: true,
  }),
)
app.use(express.json())

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/helados", heladosRoutes)
app.use("/api/insumos", insumosRoutes)

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend funcionando correctamente!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Error interno del servidor" })
})

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`)
})
