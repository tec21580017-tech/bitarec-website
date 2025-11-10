import { supabase } from './supabase-client.js'

export class AuthManager {
    static async estaLogueado() {
        const { data: { session } } = await supabase.auth.getSession()
        return !!session
    }

    static async loginUsuario(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })
            
            if (error) throw error
            
            // Buscar usuario en tu tabla usuarios
            const { data: usuarioDB } = await supabase
                .from('usuarios')
                .select('*')
                .eq('usu_email', email)
                .single()
            
            if (!usuarioDB) {
                throw new Error('Usuario no encontrado en la base de datos')
            }
            
            return { 
                success: true, 
                user: data.user,
                usuario: usuarioDB
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async registrarUsuario(nombre, email, password) {
        try {
            // 1. Registrar en Auth de Supabase
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nombre: nombre,
                        creado_en: new Date().toISOString()
                    }
                }
            })
            
            if (error) throw error
            
            // 2. Crear usuario en tu tabla usuarios (con tu esquema)
            if (data.user) {
                const { error: dbError } = await supabase
                    .from('usuarios')
                    .insert([
                        { 
                            usu_email: email,
                            usu_password: '', // No guardamos password aquí, usa Auth
                            usu_nombre: nombre,
                            usu_rol: 'basico',
                            usu_plan: 'free',
                            usu_estado: 'activo',
                            usu_fecha_registro: new Date().toISOString()
                        }
                    ])
                
                if (dbError) {
                    console.log('Error creando usuario en BD:', dbError)
                    // Si falla, eliminar el usuario de auth
                    await supabase.auth.admin.deleteUser(data.user.id)
                    throw new Error('Error al crear perfil de usuario')
                }
            }
            
            return { success: true, user: data.user }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    static async logout() {
        const { error } = await supabase.auth.signOut()
        if (!error) {
            window.location.href = 'index.html'
        }
    }

    static async getUsuarioActual() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            // Buscar en tu tabla usuarios
            const { data: usuario } = await supabase
                .from('usuarios')
                .select('*')
                .eq('usu_email', user.email)
                .single()
            
            return usuario
        }
        return null
    }

    static async obtenerUsuarioPorEmail(email) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('usu_email', email)
                .single()
            
            if (error) throw error
            return { success: true, usuario: data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}