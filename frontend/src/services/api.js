import axios from "axios"

const API_URL = "http://localhost:3001/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.reload()
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  verify: () => api.get("/auth/verify"),
}

// Helados API
export const heladosAPI = {
  getAll: () => api.get("/helados"),
  getById: (id) => api.get(`/helados/${id}`),
  create: (helado) => api.post("/helados", helado),
  update: (id, helado) => api.put(`/helados/${id}`, helado),
  delete: (id) => api.delete(`/helados/${id}`),
  updateStock: (id, stock) => api.patch(`/helados/${id}/stock`, { stock }),
}

// Insumos API
export const insumosAPI = {
  getAll: () => api.get("/insumos"),
  getById: (id) => api.get(`/insumos/${id}`),
  create: (insumo) => api.post("/insumos", insumo),
  update: (id, insumo) => api.put(`/insumos/${id}`, insumo),
  delete: (id) => api.delete(`/insumos/${id}`),
  updateStock: (id, stock) => api.patch(`/insumos/${id}/stock`, { stock }),
  getStockBajo: () => api.get("/insumos/alerts/stock-bajo"),
}

export default api
