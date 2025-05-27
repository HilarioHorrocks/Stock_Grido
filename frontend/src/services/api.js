import { supabase } from './supabase.js'

// API de Helados con Supabase
export const heladosAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('helados')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error al obtener helados:', error)
      throw error
    }
    
    return { data: { data, success: true, total: data.length } }
  },

  create: async (heladoData) => {
    const { data, error } = await supabase
      .from('helados')
      .insert([{
        nombre: heladoData.nombre.trim(),
        stock: Number(heladoData.stock),
        precio: Number(heladoData.precio),
        categoria: heladoData.categoria.trim()
      }])
      .select()
    
    if (error) {
      console.error('Error al crear helado:', error)
      throw error
    }
    
    return { data: { data: data[0], success: true } }
  },

  update: async (id, heladoData) => {
    const { data, error } = await supabase
      .from('helados')
      .update({
        nombre: heladoData.nombre.trim(),
        stock: Number(heladoData.stock),
        precio: Number(heladoData.precio),
        categoria: heladoData.categoria.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error al actualizar helado:', error)
      throw error
    }
    
    return { data: { data: data[0], success: true } }
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('helados')
      .delete()
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error al eliminar helado:', error)
      throw error
    }
    
    return { data: { data: data[0], success: true } }
  },

  updateStock: async (id, stock) => {
    const { data, error } = await supabase
      .from('helados')
      .update({ 
        stock: Number(stock),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error al actualizar stock:', error)
      throw error
    }
    
    return { data: { data: data[0], success: true } }
  }
}

// API de Insumos con Supabase
export const insumosAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error al obtener insumos:', error)
      throw error
    }
    
    // Agregar información de estado de stock
    const insumosConEstado = data.map(insumo => ({
      ...insumo,
      stockBajo: insumo.stock <= insumo.stock_minimo,
      valorTotal: insumo.stock * (insumo.precio || 0),
      stockMinimo: insumo.stock_minimo // Mapear nombre de campo
    }))
    
    return { 
      data: { 
        data: insumosConEstado, 
        success: true, 
        total: data.length,
        stockBajo: insumosConEstado.filter(i => i.stockBajo).length
      } 
    }
  },

  create: async (insumoData) => {
    const { data, error } = await supabase
      .from('insumos')
      .insert([{
        nombre: insumoData.nombre.trim(),
        stock: Number(insumoData.stock),
        unidad: insumoData.unidad.trim(),
        proveedor: insumoData.proveedor.trim(),
        stock_minimo: Number(insumoData.stockMinimo),
        precio: Number(insumoData.precio || 0)
      }])
      .select()
    
    if (error) {
      console.error('Error al crear insumo:', error)
      throw error
    }
    
    return { data: { data: data[0], success: true } }
  },

  update: async (id, insumoData) => {
    const { data, error } = await supabase
      .from('insumos')
      .update({
        nombre: insumoData.nombre.trim(),
        stock: Number(insumoData.stock),
        unidad: insumoData.unidad.trim(),
        proveedor: insumoData.proveedor.trim(),
        stock_minimo: Number(insumoData.stockMinimo),
        precio: Number(insumoData.precio || 0),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error al actualizar insumo:', error)
      throw error
    }
    
    return { data: { data: data[0], success: true } }
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('insumos')
      .delete()
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error al eliminar insumo:', error)
      throw error
    }
    
    return { data: { data: data[0], success: true } }
  },

  updateStock: async (id, stock) => {
    const { data, error } = await supabase
      .from('insumos')
      .update({ 
        stock: Number(stock),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error al actualizar stock:', error)
      throw error
    }
    
    return { data: { data: data[0], success: true } }
  }
}

// API de Autenticación (simple)
export const authAPI = {
  login: async (credentials) => {
    // Simulación de delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Credenciales válidas
    const validCredentials = [
      { username: 'admin', password: '123' },
      { username: 'heladeria', password: '12345' }
    ]
    
    const isValid = validCredentials.some(
      cred => cred.username === credentials.username && cred.password === credentials.password
    )
    
    if (isValid) {
      const user = {
        id: 1,
        username: credentials.username,
        role: 'admin'
      }
      
      const token = `token-${Date.now()}-${credentials.username}`
      
      return {
        data: {
          message: 'Login exitoso',
          token,
          user
        }
      }
    } else {
      throw { response: { data: { message: 'Credenciales incorrectas' } } }
    }
  },

  verify: async () => {
    const token = localStorage.getItem('token')
    
    if (token && token.startsWith('token-')) {
      return {
        data: {
          valid: true,
          user: {
            id: 1,
            username: 'admin',
            role: 'admin'
          }
        }
      }
    } else {
      throw new Error('Token inválido')
    }
  }
}

export default { heladosAPI, insumosAPI, authAPI }