import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = express.Router()

// Usuario admin por defecto (en producción esto debería estar en una base de datos)
const adminUser = {
  id: 1,
  username: "Heladeria",
  password: "123", // Sin encriptar para probar
  role: "admin",
}

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    // Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({ message: "Usuario y contraseña son requeridos" })
    }

    // Verificar usuario
    if (username !== adminUser.username) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    // Verificar contraseña
    const isValidPassword = password === adminUser.password
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales incorrectas" })
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
      },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "24h" },
    )

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ message: "Error del servidor" })
  }
})

// Verificar token
router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key")
    res.json({ valid: true, user: decoded })
  } catch (error) {
    res.status(401).json({ message: "Token inválido" })
  }
})

export default router
