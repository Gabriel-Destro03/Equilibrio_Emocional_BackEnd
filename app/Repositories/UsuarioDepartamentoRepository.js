'use strict'

const Config = use('Config')

class UsuarioDepartamentoRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAll() {
        const { data, error } = await this.supabase
            .from('usuario_departamento')
            .select('*')

        if (error) {
            console.error('Erro ao buscar todos usuario_departamento:', error.message)
            throw new Error(`Erro ao buscar todos usuario_departamento: ${error.message}`)
        }
        return data
    }

    async getUsersByIds(ids) {
        const { data, error } = await this.supabase
            .from('usuario_departamento')
            .select('*')
            .in('id_usuario', ids);

        if (error) {
            console.error('Erro ao buscar todos usuario_departamento:', error.message)
            throw new Error(`Erro ao buscar todos usuario_departamento: ${error.message}`)
        }
        return data
    }

    async getByUsuarioAndDepartamento(idUsuario, idDepartamento) {
        const { data, error } = await this.supabase
            .from('usuario_departamento')
            .select('*')
            .eq('id_usuario', idUsuario)
            .eq('id_departamento', idDepartamento)

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Erro ao buscar usuario_departamento por usuario e departamento:', error.message)
            throw new Error(`Erro ao buscar usuario_departamento: ${error.message}`)
        }

        // Handle no rows found explicitly
        if (error && error.code === 'PGRST116') {
            return null
        }

        return data
    }

    async getByUsuarioAndDepartamentoINIds(ids){
        const { data, error } = await this.supabase
            .from('usuario_departamento')
            .select(`
                *,
                departamentos(
                *,
                filiais(*)
                ),
                usuarios(*)
            `)
            .in('id_departamento', ids);
            
        return data
    }
    
    async create(usuarioDepartamentoData) {
        const { data, error } = await this.supabase
            .from('usuario_departamento')
            .insert([usuarioDepartamentoData])
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar usuario_departamento:', error.message)
            throw new Error(`Erro ao criar usuario_departamento: ${error.message}`)
        }
        return data
    }

    async update(idUsuario, idDepartamento, updateData) {
         const { data, error } = await this.supabase
            .from('usuario_departamento')
            .update(updateData)
            .eq('id_usuario', idUsuario)
            .eq('id_departamento', idDepartamento)
            .select()

        if (error) {
            console.error('Erro ao atualizar usuario_departamento:', error.message)
            throw new Error(`Erro ao atualizar usuario_departamento: ${error.message}`)
        }
        return data
    }

    async delete(idUsuario, idDepartamento) {
        const { error } = await this.supabase
            .from('usuario_departamento')
            .delete()
            .eq('id_usuario', idUsuario)
            .eq('id_departamento', idDepartamento)

        if (error) {
             console.error('Erro ao deletar usuario_departamento:', error.message)
            throw new Error(`Erro ao deletar usuario_departamento: ${error.message}`)
        }
         // Supabase delete does not return data by default, just error
         return { message: 'UsuarioDepartamento deletado com sucesso' }
    }

    async getUserByIdSingle(idUsuario) {
        const { data, error } = await this.supabase
            .from('usuario_departamento')
            .select('*')
            .eq('id_usuario', idUsuario)

        if (error) {
            console.error('Erro ao buscar uid do usuário:', error.message)
            throw new Error(`Erro ao buscar uid do usuário: ${error.message}`)
        }

        return data
    }
}

module.exports = UsuarioDepartamentoRepository 