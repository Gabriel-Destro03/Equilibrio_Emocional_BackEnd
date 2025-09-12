'use strict'

const Config = use('Config')

class PermissaoRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    /**
     * Busca permissões de um usuário
     * @param {string} uid - UID do usuário
     * @returns {Promise<Array>} Lista de permissões
     */
    async getUserPermissions(uid) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .select(`*,
                permissoes(tag)
            `)
            .eq('uid', uid)

        if (error) throw new Error(error.message)
        return data || []
    }

    /**
     * Insere permissões para um usuário
     * @param {Array} permissoes - Array de permissões para inserir
     * @returns {Promise<Array>} Dados inseridos
     */
    async insertUserPermissions(permissoes) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .insert(permissoes)

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Remove permissões específicas de um usuário
     * @param {number} userId - ID do usuário
     * @param {Array} permissionIds - IDs das permissões para remover
     * @returns {Promise<Array>} Dados removidos
     */
    async removeUserPermissions(userId, permissionIds) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .delete()
            .eq('id_user', userId)
            .in('id_permissao', permissionIds)

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Verifica se um usuário tem uma permissão específica
     * @param {string} uid - UID do usuário
     * @param {number} permissionId - ID da permissão
     * @returns {Promise<boolean>} True se tem a permissão
     */
    async hasPermission(uid, permissionId) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .select('*')
            .eq('uid', uid)
            .eq('id_permissao', permissionId)
            .single()

        if (error && error.code !== 'PGRST116') throw new Error(error.message)
        return !!data
    }

    /**
     * Verifica se um usuário tem todas as permissões de uma lista
     * @param {string} uid - UID do usuário
     * @param {Array} permissionIds - IDs das permissões
     * @returns {Promise<boolean>} True se tem todas as permissões
     */
    async hasAllPermissions(uid, permissionIds) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .select('id_permissao')
            .eq('uid', uid)
            .in('id_permissao', permissionIds)

        if (error) throw new Error(error.message)
        return data.length === permissionIds.length
    }

    /**
     * Busca permissões com detalhes completos
     * @param {string} uid - UID do usuário
     * @returns {Promise<Array>} Lista de permissões com detalhes
     */
    async getUserPermissionsWithDetails(uid) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .select(`
                *,
                permissoes:permissoes(*)
            `)
            .eq('uid', uid)

        if (error) throw new Error(error.message)
        return data || []
    }

    /**
     * Remove todas as permissões de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Array>} Dados removidos
     */
    async removeAllUserPermissions(userId) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .delete()
            .eq('id_user', userId)

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Busca usuários que têm uma permissão específica
     * @param {number} permissionId - ID da permissão
     * @returns {Promise<Array>} Lista de usuários
     */
    async getUsersWithPermission(permissionId) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .select(`
                *,
                usuario:usuarios(*)
            `)
            .eq('id_permissao', permissionId)

        if (error) throw new Error(error.message)
        return data || []
    }
}

module.exports = PermissaoRepository
