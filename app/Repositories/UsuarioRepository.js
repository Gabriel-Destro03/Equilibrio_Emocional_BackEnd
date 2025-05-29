'use strict'

const Config = use('Config')

class UsuarioRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllUsuarios() {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('status', true)

        if (error) throw new Error(error.message)
        return data
    }

    async getUsuarioById(id) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .eq('status', true)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getUsuarioByEmail(email) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('status', true)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async createUsuario(usuarioData) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .insert([{ ...usuarioData, status: true }])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async updateUsuario(id, usuarioData) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .update(usuarioData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async inactivateUsuario(id) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .update({ status: false })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = UsuarioRepository 