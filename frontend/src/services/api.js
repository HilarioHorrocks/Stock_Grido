import { supabase } from './supabase.js';

// ==========================
// AUTH API
// ==========================
export const authAPI = {
  login: async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      console.error("Error al iniciar sesión:", error.message);
      throw new Error("Credenciales incorrectas");
    }

    return {
      data: {
        message: 'Login exitoso',
        token: data.session.access_token,
        user: data.user
      }
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
  },

  verify: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión no válida");
    return {
      data: {
        valid: true,
        user
      }
    };
  }
};

// ==========================
// HELADOS API
// ==========================
export const heladosAPI = {
  getAll: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('helados')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener helados:', error);
      throw error;
    }

    return { data: { data, success: true, total: data.length } };
  },

  create: async (heladoData) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('helados')
      .insert([{
        nombre: heladoData.nombre.trim(),
        stock: Number(heladoData.stock),
        precio: Number(heladoData.precio),
        categoria: heladoData.categoria.trim(),
        user_id: userId
      }])
      .select();

    if (error) {
      console.error('Error al crear helado:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  update: async (id, heladoData) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

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
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al actualizar helado:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  delete: async (id) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('helados')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al eliminar helado:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  updateStock: async (id, stock) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('helados')
      .update({
        stock: Number(stock),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al actualizar stock:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  }
};

// ==========================
// INSUMOS API
// ==========================
export const insumosAPI = {
  getAll: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener insumos:', error);
      throw error;
    }

    const insumosConEstado = data.map(insumo => ({
      ...insumo,
      stockBajo: insumo.stock <= insumo.stock_minimo,
      valorTotal: insumo.stock * (insumo.precio || 0),
      stockMinimo: insumo.stock_minimo
    }));

    return {
      data: {
        data: insumosConEstado,
        success: true,
        total: data.length,
        stockBajo: insumosConEstado.filter(i => i.stockBajo).length
      }
    };
  },

  create: async (insumoData) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('insumos')
      .insert([{
        nombre: insumoData.nombre.trim(),
        stock: Number(insumoData.stock),
        unidad: insumoData.unidad.trim(),
        proveedor: insumoData.proveedor.trim(),
        stock_minimo: Number(insumoData.stockMinimo),
        precio: Number(insumoData.precio || 0),
        user_id: userId
      }])
      .select();

    if (error) {
      console.error('Error al crear insumo:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  update: async (id, insumoData) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

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
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al actualizar insumo:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  delete: async (id) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('insumos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al eliminar insumo:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  updateStock: async (id, stock) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('insumos')
      .update({
        stock: Number(stock),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al actualizar stock:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  }
};
// ==========================
// IMPULSIVOS API
// ==========================
export const impulsivosAPI = {
  getAll: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('impulsivos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener impulsivos:', error);
      throw error;
    }

    return { data: { data, success: true, total: data.length } };
  },

  create: async (impulsivoData) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('impulsivos')
      .insert([{
        nombre: impulsivoData.nombre.trim(),
        stock: Number(impulsivoData.stock),
        precio: Number(impulsivoData.precio),
        categoria: impulsivoData.categoria.trim(),
        user_id: userId
      }])
      .select();

    if (error) {
      console.error('Error al crear impulsivo:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  update: async (id, impulsivoData) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('impulsivos')
      .update({
        nombre: impulsivoData.nombre.trim(),
        stock: Number(impulsivoData.stock),
        precio: Number(impulsivoData.precio),
        categoria: impulsivoData.categoria.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al actualizar impulsivo:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  delete: async (id) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('impulsivos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al eliminar impulsivo:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  },

  updateStock: async (id, stock) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { data, error } = await supabase
      .from('impulsivos')
      .update({
        stock: Number(stock),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error al actualizar stock:', error);
      throw error;
    }

    return { data: { data: data[0], success: true } };
  }
};

export default { authAPI, heladosAPI, insumosAPI, impulsivosAPI };

