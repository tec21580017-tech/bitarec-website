import { supabase } from './supabase-client.js'

export class BitacoraManager {
    static async crearBitacora(usuario_id, datos) {
        try {
            // Primero obtener el usu_id del usuario autenticado
            const { data: usuario, error: userError } = await supabase
                .from('usuarios')
                .select('usu_id')
                .eq('usu_email', (await supabase.auth.getUser()).data.user.email)
                .single()
            
            if (userError) throw userError

            const { data, error } = await supabase
                .from('bitacoras')
                .insert([
                    {
                        usu_id: usuario.usu_id,
                        bit_titulo: datos.titulo,
                        bit_descripcion: datos.descripcion,
                        bit_tipo: datos.tipo || 'personal',
                        bit_configuracion: datos.configuracion || {},
                        bit_publica: datos.publica || false,
                        bit_estado: 'activa',
                        bit_fecha_creacion: new Date().toISOString(),
                        bit_ultima_actualizacion: new Date().toISOString()
                    }
                ])
                .select()
            
            if (error) throw error
            return { success: true, bitacora: data[0] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async obtenerBitacorasUsuario(usuario_id = null) {
        try {
            let query = supabase
                .from('bitacoras')
                .select('*')
                .eq('bit_estado', 'activa')
                .order('bit_ultima_actualizacion', { ascending: false })

            // Si se proporciona usuario_id, filtrar por usuario
            if (usuario_id) {
                query = query.eq('usu_id', usuario_id)
            } else {
                // Obtener bitácoras del usuario actual
                const { data: usuario, error: userError } = await supabase
                    .from('usuarios')
                    .select('usu_id')
                    .eq('usu_email', (await supabase.auth.getUser()).data.user.email)
                    .single()
                
                if (userError) throw userError
                query = query.eq('usu_id', usuario.usu_id)
            }

            const { data, error } = await query
            
            if (error) throw error
            return { success: true, bitacoras: data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async obtenerBitacora(bitacora_id) {
        try {
            const { data, error } = await supabase
                .from('bitacoras')
                .select('*')
                .eq('bit_id', bitacora_id)
                .single()
            
            if (error) throw error
            return { success: true, bitacora: data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async actualizarBitacora(bitacora_id, datos) {
        try {
            const { data, error } = await supabase
                .from('bitacoras')
                .update({
                    bit_titulo: datos.titulo,
                    bit_descripcion: datos.descripcion,
                    bit_tipo: datos.tipo,
                    bit_configuracion: datos.configuracion,
                    bit_publica: datos.publica,
                    bit_ultima_actualizacion: new Date().toISOString()
                })
                .eq('bit_id', bitacora_id)
                .select()
            
            if (error) throw error
            return { success: true, bitacora: data[0] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async eliminarBitacora(bitacora_id) {
        try {
            const { error } = await supabase
                .from('bitacoras')
                .update({ 
                    bit_estado: 'eliminada',
                    bit_fecha_eliminacion: new Date().toISOString()
                })
                .eq('bit_id', bitacora_id)
            
            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async eliminarPermanentemente(bitacora_id) {
        try {
            const { error } = await supabase
                .from('bitacoras')
                .delete()
                .eq('bit_id', bitacora_id)
            
            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async restaurarBitacora(bitacora_id) {
        try {
            const { error } = await supabase
                .from('bitacoras')
                .update({ 
                    bit_estado: 'activa',
                    bit_fecha_eliminacion: null
                })
                .eq('bit_id', bitacora_id)
            
            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async obtenerBitacorasEliminadas() {
        try {
            const { data: usuario } = await supabase
                .from('usuarios')
                .select('usu_id')
                .eq('usu_email', (await supabase.auth.getUser()).data.user.email)
                .single()

            const { data, error } = await supabase
                .from('bitacoras')
                .select('*')
                .eq('usu_id', usuario.usu_id)
                .eq('bit_estado', 'eliminada')
                .order('bit_fecha_eliminacion', { ascending: false })
            
            if (error) throw error
            return { success: true, bitacoras: data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}