'use strict'

const Config = use('Config')

class UsuarioFilialRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAll() {
        const { data, error } = await this.supabase
            .from('usuario_filial')
            .select('*')

        if (error) {
            console.error('Erro ao buscar todos usuario_filial:', error.message)
            throw new Error(`Erro ao buscar todos usuario_filial: ${error.message}`)
        }
        return data
    }

    async getByUsuarioAndFilial(idUsuario, idFilial) {
        const { data, error } = await this.supabase
            .from('usuario_filial')
            .select('*')
            .eq('id_usuario', idUsuario)
            .eq('id_filial', idFilial)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Erro ao buscar usuario_filial por usuario e filial:', error.message)
            throw new Error(`Erro ao buscar usuario_filial: ${error.message}`)
        }

        // Handle no rows found explicitly
        if (error && error.code === 'PGRST116') {
            return null
        }

        return data
    }

    async getRepresentantesByFilialId(idFilial) {
        const { data, error } = await this.supabase
            .from('usuario_filial')
            .select(`
                *,\
                usuarios(nome_completo)\
            `)
            .eq('id_filial', idFilial)

        if (error) {
            console.error('Erro ao buscar representantes por filial:', error.message)
            throw new Error(`Erro ao buscar representantes por filial: ${error.message}`)
        }
        return data
    }

    async create(usuarioFilialData) {
        const { data, error } = await this.supabase
            .from('usuario_filial')
            .insert([usuarioFilialData])
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar usuario_filial:', error.message)
            throw new Error(`Erro ao criar usuario_filial: ${error.message}`)
        }
        return data
    }

    async update(idUsuario, idFilial, updateData) {
         const { data, error } = await this.supabase
            .from('usuario_filial')
            .update(updateData)
            .eq('id_usuario', idUsuario)
            .eq('id_filial', idFilial)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar usuario_filial:', error.message)
            throw new Error(`Erro ao atualizar usuario_filial: ${error.message}`)
        }
        return data
    }

    async delete(idUsuario, idFilial) {
        const { error } = await this.supabase
            .from('usuario_filial')
            .delete()
            .eq('id_usuario', idUsuario)
            .eq('id_filial', idFilial)

        if (error) {
             console.error('Erro ao deletar usuario_filial:', error.message)
            throw new Error(`Erro ao deletar usuario_filial: ${error.message}`)
        }
         // Supabase delete does not return data by default, just error
         return { message: 'UsuarioFilial deletado com sucesso' }
    }
}

module.exports = UsuarioFilialRepository 