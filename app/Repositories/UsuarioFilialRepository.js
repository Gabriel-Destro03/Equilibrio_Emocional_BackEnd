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
            .maybeSingle()

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
            .from('usuarios')
            .select(`*,
                usuario_filial(id_usuario, id_filial, is_representante)    
            `)
            .eq('empresa_id', idFilial)
        //const dataFiltrado = data.filter(d => d.usuarios != null && (d.usuarios?.empresa_id == idFilial))

        if (error) {
            console.error('Erro ao buscar representantes por filial:', error.message)
            throw new Error(`Erro ao buscar representantes por filial: ${error.message}`)
        }
        return data
    }

    async getRepresentantesByEmpresaId(idEmpresa) {
        const { data, error } = await this.supabase
            .from('usuario_filial')
            .select(`
                *,\
                usuarios(nome_completo)\
            `)
            .eq('usuarios.empresa_id', idEmpresa)

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

    async updateUsuarioFilial(idUsuario, idFilial, updateData) {
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
                .from('usuario_filial')
                .update(updateData)
                .eq('id_usuario', idUsuario)
                .eq('id_filial', idFilial)
                .select()
                .single()

            if (error) throw new Error(error.message)

            // Se estiver adicionando como representante
            if (updateData.is_representante === true) {
                // Adiciona as permissões 3, 4 e 5
                const permissoesParaAdicionar = [
                    { id_user: idUsuario, id_permissao: 1, uid },
                    { id_user: idUsuario, id_permissao: 3, uid },
                    { id_user: idUsuario, id_permissao: 4, uid },
                    { id_user: idUsuario, id_permissao: 5, uid }
                ]

                const { error: insertError } = await this.supabase
                    .from('usuario_permissoes')
                    .insert(permissoesParaAdicionar)

                if (insertError) throw new Error(`Erro ao adicionar permissões: ${insertError.message}`)
            } 
            // Se estiver removendo como representante
            else if (updateData.is_representante === false) {
                // Remove as permissões 1, 3, 4 e 5
                const { error: deleteError } = await this.supabase
                    .from('usuario_permissoes')
                    .delete()
                    .eq('id_user', idUsuario)
                    .in('id_permissao', [1, 3, 4, 5])

                if (deleteError) throw new Error(`Erro ao remover permissões: ${deleteError.message}`)
            }

            return data
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário filial: ${error.message}`)
        }
    }
}

module.exports = UsuarioFilialRepository 