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
            .limit(1)

        if (error) throw new Error(error.message)
        return data && data.length > 0 ? data[0] : null
    }

    async createUsuario(usuarioData) {
        try {
            const { data, error } = await this.supabase
                .from('usuarios')
                .insert([{ 
                    nome_completo: usuarioData.nome_completo,
                    email: usuarioData.email,
                    telefone: usuarioData.telefone,
                    cargo: usuarioData.cargo,
                    status: true,
                    uid: usuarioData.uid
                }])
                .select('*')
                .single()
                
            await this.supabase.from('usuario_filial')
            .insert([{
                id_usuario: data.id,
                id_filial: usuarioData.id_filial
            }]);

            await this.supabase.from('usuario_departamento')
            .insert([{
                id_usuario: data.id,
                id_departamento: usuarioData.id_departamento
            }])


            if (error) {
                console.error('Erro ao criar usuário no banco:', error)
                throw new Error(error.message)
            }

            if (!data) {
                console.error('Dados do usuário não retornados após criação')
                throw new Error('Erro ao criar usuário: Dados não retornados')
            }

            return data
        } catch (error) {
            console.error('Erro na criação do usuário:', error)
            throw error
        }
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

    async inactivateUsuario(id, status) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = UsuarioRepository 