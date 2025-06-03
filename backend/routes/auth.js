import express from "express"
import jwt from "jsonwebtoken"

const router = express.Router()

// ⚙️ Clave secreta para firmar el token (en un entorno real usá .env)
const SECRET_KEY = "clave_secreta_super_segura"

// 📌 Ruta para login (ficticio - se valida usuario hardcodeado)
router.post("/login", (req, res) => {
  const { email, password } = req.body

  // Simulación de login (reemplazá por una consulta real a base de datos)
  if (email === "admin@heladeria.com" && password === "admin123") {
    const user = { email }
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" })
    return res.json({ token })
  }

  res.status(401).json({ message: "Credenciales inválidas" })
})

// 🔒 Ruta protegida de ejemplo
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Acceso autorizado", user: req.user })
})

// Middleware para verificar token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(403).json({ message: "Token requerido" })

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido o expirado" })
    req.user = user
    next()
  })
}

export default router
