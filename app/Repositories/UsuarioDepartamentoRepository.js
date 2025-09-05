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

    async getDepartamentoById(idDepartamento) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .select(`id, id_filial`)
            .eq('id', idDepartamento)
            .single()
    
        if (error) {
            throw new Error(`Erro ao buscar departamento: ${error.message}`)
        }
        return data
    }

    async getUsuariosByFilialId(idFilial) {
        const { data, error } = await this.supabase
            .from('usuario_filial')
            .select(`
                id,
                id_usuario,
                id_filial,
                created_at,
                status,
                usuarios ( nome_completo )
            `)
            .eq('id_filial', idFilial)
    
        if (error) {
            throw new Error(`Erro ao buscar usuários da filial: ${error.message}`)
        }
        return data
    }

    async getUsuariosByDepartamentoId(idDepartamento) {
        const { data, error } = await this.supabase
            .from('usuario_departamento')
            .select(`
                id,
                id_usuario,
                id_departamento,
                is_representante
            `)
            .eq('id_departamento', idDepartamento)
    
        if (error) {
            throw new Error(`Erro ao buscar usuários do departamento: ${error.message}`)
        }
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

        // Verifica se encontrou registros para atualizar
        if (!data || data.length === 0) {
            throw new Error('Nenhum registro encontrado para atualização')
        }

        // Retorna o primeiro registro atualizado
        return data[0]
    }

    // Helper: verificar se o usuário é representante em algum departamento
    async userHasAnyDepartamentoRepresentante(idUsuario) {
        const { data, error } = await this.supabase
            .from('usuario_departamento')
            .select('id')
            .eq('id_usuario', idUsuario)
            .eq('is_representante', true)
            .limit(1)

        if (error) {
            console.error('Erro ao verificar representante em departamento:', error.message)
            throw new Error(`Erro ao verificar representante em departamento: ${error.message}`)
        }
        return Array.isArray(data) && data.length > 0
    }

    // Helper: remover permissões específicas do usuário
    async removeUserPermissions(idUsuario, permissionIds) {
        const { error } = await this.supabase
            .from('usuario_permissoes')
            .delete()
            .eq('id_user', idUsuario)
            .in('id_permissao', permissionIds)

        if (error) {
            console.error('Erro ao remover permissões do usuário:', error.message)
            throw new Error(`Erro ao remover permissões do usuário: ${error.message}`)
        }
        return { removed: permissionIds }
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
}

module.exports = UsuarioDepartamentoRepository 