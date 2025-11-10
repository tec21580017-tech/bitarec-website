import { supabase } from './supabase-client.js'

export class EntradaManager {
    static async crearEntrada(bitacora_id, datos) {
        try {
            const { data, error } = await supabase
                .from('entradas')
                .insert([
                    {
                        bit_id: bitacora_id,
                        ent_titulo: datos.titulo,
                        ent_contenido: datos.contenido,
                        ent_etiquetas: datos.etiquetas || '',
                        ent_estado: 'activa',
                        ent_fecha_creacion: new Date().toISOString()
                    }
                ])
                .select()
            
            if (error) throw error
            return { success: true, entrada: data[0] }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async obtenerEntradasBitacora(bitacora_id) {
        try {
            const { data, error } = await supabase
                .from('entradas')
                .select('*')
                .eq('bit_id', bitacora_id)
                .eq('ent_estado', 'activa')
                .order('ent_fecha_creacion', { ascending: false })
            
            if (error) throw error
            return { success: true, entradas: data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async obtenerEntradasRecientes(usuario_id, limite = 10) {
        try {
            const { data, error } = await supabase
                .from('entradas')
                .select(`
                    *,
                    bitacoras (
                        bit_titulo,
                        usu_id
                    )
                `)
                .eq('bitacoras.usu_id', usuario_id)
                .eq('ent_estado', 'activa')
                .order('ent_fecha_creacion', { ascending: false })
                .limit(limite)
            
            if (error) throw error
            return { success: true, entradas: data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async buscarEntradas(usuario_id, termino) {
        try {
            const { data, error } = await supabase
                .from('entradas')
                .select(`
                    *,
                    bitacoras (
                        bit_titulo,
                        usu_id
                    )
                `)
                .eq('bitacoras.usu_id', usuario_id)
                .eq('ent_estado', 'activa')
                .or(`ent_titulo.ilike.%${termino}%,ent_contenido.ilike.%${termino}%,ent_etiquetas.ilike.%${termino}%`)
                .order('ent_fecha_creacion', { ascending: false })
            
            if (error) throw error
            return { success: true, entradas: data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}