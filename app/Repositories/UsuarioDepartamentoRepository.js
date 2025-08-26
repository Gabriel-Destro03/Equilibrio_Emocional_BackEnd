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
            .single()

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

    async getRepresentantesByDepartamentoId(idDepartamento) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select(`*,
                usuario_departamento(id_usuario, id_departamento, is_representante)
            `)
            .eq('empresa_id', idDepartamento)
        // .from('usuario_departamento')
            // .select(`
            //     *,
            //     usuarios(nome_completo, empresa_id)
            // `)
        
            // const dataFiltrado = data.filter(d => d.usuarios != null && (d.usuarios?.empresa_id == idDepartamento))

        if (error) {
            console.error('Erro ao buscar representantes por departamento:', error.message)
            throw new Error(`Erro ao buscar representantes por departamento: ${error.message}`)
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
            .single()

        if (error) {
            console.error('Erro ao atualizar usuario_departamento:', error.message)
            throw new Error(`Erro ao atualizar usuario_departamento: ${error.message}`)
        }
        return data
    }

    async updateUsuarioDepartamento(idUsuario, idDepartamento, updateData) {
        try {
            // Primeiro, busca o uid do usuário
            const { data: usuarioData, error: usuarioError } = await this.supabase
                .from('usuarios')
                .select('uid')
                .eq('id', idUsuario)
                .single()

            if (usuarioError) throw new Error(usuarioError.message)
            if (!usuarioData) throw new Error('Usuário não encontrado')

            const uid = usuarioData.uid

            // Atualiza o status de representante
            const { data, error } = await this.supabase
                .from('usuario_departamento')
                .update(updateData)
                .eq('id_usuario', idUsuario)
                .eq('id_departamento', idDepartamento)
                .select()
                .single()

            if (error) throw new Error(error.message)

            // Se estiver adicionando como representante
            if (updateData.is_representante === true) {
                // Adiciona as permissões 1, 4 e 6
                const permissoesParaAdicionar = [
                    { id_user: idUsuario, id_permissao: 1, uid },
                    { id_user: idUsuario, id_permissao: 4, uid },
                    { id_user: idUsuario, id_permissao: 6, uid }
                ]

                const { error: insertError } = await this.supabase
                    .from('usuario_permissoes')
                    .insert(permissoesParaAdicionar)

                if (insertError) throw new Error(`Erro ao adicionar permissões: ${insertError.message}`)
            } 
            // Se estiver removendo como representante
            else if (updateData.is_representante === false) {
                // Remove as permissões 3, 4 e 5
                const { error: deleteError } = await this.supabase
                    .from('usuario_permissoes')
                    .delete()
                    .eq('id_user', idUsuario)
                    .in('id_permissao', [1, 4, 6])

                if (deleteError) throw new Error(`Erro ao remover permissões: ${deleteError.message}`)
            }

            return data
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário departamento: ${error.message}`)
        }
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