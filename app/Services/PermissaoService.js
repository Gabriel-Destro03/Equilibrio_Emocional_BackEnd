'use strict'

const PermissaoRepository = require('../Repositories/PermissaoRepository')

class PermissaoService {
    constructor() {
        this.repository = new PermissaoRepository()
        
        // Tipos de representante e suas permissões
        this.representativeTypes = {
            'rep_departamento': [1, 4, 6],
            'rep_filial': [1, 3, 4, 5],
            'rep_empresa': [1, 2, 3, 4, 9]
        }
    }

    /**
     * Adiciona permissões para um usuário, evitando duplicatas
     * @param {number} userId - ID do usuário
     * @param {string} uid - UID do usuário
     * @param {Array} permissionIds - IDs das permissões para adicionar
     */
    async addPermissionsToUser(userId, uid, permissionIds) {
        try {
            console.log(`[DEBUG] addPermissionsToUser - userId: ${userId}, uid: ${uid}, permissions: ${permissionIds}`)
            
            // 1. Buscar permissões existentes
            const permissoesExistentes = await this.repository.getUserPermissions(uid)
            console.log(`[DEBUG] Permissões existentes para uid ${uid}:`, permissoesExistentes)
            
            // 2. Identificar permissões faltantes
            const permissoesFaltantes = permissionIds.filter(id => 
                !permissoesExistentes.some(p => p.id_permissao === id)
            )
            console.log(`[DEBUG] Permissões faltantes:`, permissoesFaltantes)

            // 3. Adicionar apenas as permissões faltantes
            if (permissoesFaltantes.length > 0) {
                const permissoesParaInserir = permissoesFaltantes.map(id => ({
                    id_user: userId,
                    id_permissao: id,
                    uid: uid
                }))
                console.log(`[DEBUG] Permissões para inserir:`, permissoesParaInserir)

                await this.repository.insertUserPermissions(permissoesParaInserir)
                console.log(`[DEBUG] Permissões inseridas com sucesso`)
            } else {
                console.log(`[DEBUG] Nenhuma permissão nova para inserir`)
            }
        } catch (error) {
            console.error(`Erro ao adicionar permissões para usuário ${userId}:`, error.message)
            throw new Error(`Erro ao adicionar permissões: ${error.message}`)
        }
    }

    /**
     * Adiciona permissões baseadas no tipo de representante
     * @param {number} userId - ID do usuário
     * @param {string} uid - UID do usuário
     * @param {string} representativeType - Tipo de representante (rep_departamento, rep_filial, rep_empresa)
     */
    async addRepresentativePermissions(userId, uid, representativeType) {
        if (!this.representativeTypes[representativeType]) {
            throw new Error(`Tipo de representante inválido: ${representativeType}`)
        }

        const permissions = this.representativeTypes[representativeType]
        await this.addPermissionsToUser(userId, uid, permissions)
    }

    /**
     * Obtém as permissões de um tipo de representante
     * @param {string} representativeType - Tipo de representante
     * @returns {Array} Array de IDs das permissões
     */
    getRepresentativePermissions(representativeType) {
        if (!this.representativeTypes[representativeType]) {
            throw new Error(`Tipo de representante inválido: ${representativeType}`)
        }
        return this.representativeTypes[representativeType]
    }

    /**
     * Remove permissões específicas de um usuário
     * @param {number} userId - ID do usuário
     * @param {Array} permissionIds - IDs das permissões para remover
     */
    async removePermissionsFromUser(userId, permissionIds) {
        try {
            await this.repository.removeUserPermissions(userId, permissionIds)
        } catch (error) {
            console.error(`Erro ao remover permissões do usuário ${userId}:`, error.message)
            throw new Error(`Erro ao remover permissões: ${error.message}`)
        }
    }

    /**
     * Verifica quais permissões o usuário ainda precisa manter baseado nos tipos de representante ativos
     * @param {number} userId - ID do usuário
     * @returns {Promise<Array>} Array de IDs das permissões que devem ser mantidas
     */
    async getRequiredPermissionsForUser(userId) {
        try {
            const statusRepresentante = await this.checkUserRepresentativeStatus(userId)
            const requiredPermissions = new Set()

            // Adicionar permissões baseadas nos tipos de representante ativos
            if (statusRepresentante.outrasEmpresas.length > 0) {
                this.representativeTypes.rep_empresa.forEach(perm => requiredPermissions.add(perm))
            }
            
            if (statusRepresentante.filiais.length > 0) {
                this.representativeTypes.rep_filial.forEach(perm => requiredPermissions.add(perm))
            }
            
            if (statusRepresentante.departamentos.length > 0) {
                this.representativeTypes.rep_departamento.forEach(perm => requiredPermissions.add(perm))
            }

            return Array.from(requiredPermissions)
        } catch (error) {
            console.error(`Erro ao verificar permissões necessárias para usuário ${userId}:`, error.message)
            throw new Error(`Erro ao verificar permissões necessárias: ${error.message}`)
        }
    }

    /**
     * Remove permissões de um tipo de representante, mas mantém as permissões comuns com outros tipos
     * @param {number} userId - ID do usuário
     * @param {string} representativeType - Tipo de representante a ser removido
     */
    async removeRepresentativePermissions(userId, representativeType) {
        try {
            if (!this.representativeTypes[representativeType]) {
                throw new Error(`Tipo de representante inválido: ${representativeType}`)
            }

            // Obter permissões que devem ser mantidas
            const requiredPermissions = await this.getRequiredPermissionsForUser(userId)
            console.log(`[DEBUG] Usuário ${userId} - Permissões necessárias:`, requiredPermissions)
            
            // Obter permissões do tipo que está sendo removido
            const permissionsToRemove = this.representativeTypes[representativeType]
            console.log(`[DEBUG] Permissões do tipo ${representativeType}:`, permissionsToRemove)
            
            // Filtrar apenas as permissões que não são necessárias para outros tipos
            const permissionsToActuallyRemove = permissionsToRemove.filter(perm => 
                !requiredPermissions.includes(perm)
            )
            console.log(`[DEBUG] Permissões que serão removidas:`, permissionsToActuallyRemove)

            if (permissionsToActuallyRemove.length > 0) {
                await this.removePermissionsFromUser(userId, permissionsToActuallyRemove)
                console.log(`[DEBUG] Permissões removidas com sucesso para usuário ${userId}`)
            } else {
                console.log(`[DEBUG] Nenhuma permissão removida para usuário ${userId} - todas são necessárias para outros tipos`)
            }
        } catch (error) {
            console.error(`Erro ao remover permissões de representante ${representativeType} para usuário ${userId}:`, error.message)
            throw new Error(`Erro ao remover permissões de representante: ${error.message}`)
        }
    }

    /**
     * Verifica se um usuário ainda é representante de outras entidades
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Status de representante
     */
    async checkUserRepresentativeStatus(userId) {
        try {
            // Verificar se é representante de empresas
            const { data: outrasEmpresas, error: errorEmpresas } = await this.repository.supabase
                .from('representantes_empresas')
                .select('*')
                .eq('usuario_id', userId)

            if (errorEmpresas) throw new Error(errorEmpresas.message)

            // Verificar se é representante de filiais
            const { data: filiais, error: errorFiliais } = await this.repository.supabase
                .from('usuario_filial')
                .select('*')
                .eq('id_usuario', userId)
                .eq('is_representante', true)

            if (errorFiliais) throw new Error(errorFiliais.message)

            // Verificar se é representante de departamentos
            const { data: departamentos, error: errorDepartamentos } = await this.repository.supabase
                .from('usuario_departamento')
                .select('*')
                .eq('id_usuario', userId)
                .eq('is_representante', true)

            if (errorDepartamentos) throw new Error(errorDepartamentos.message)

            const status = {
                outrasEmpresas: outrasEmpresas || [],
                filiais: filiais || [],
                departamentos: departamentos || []
            }
            
            console.log(`[DEBUG] Status de representante para usuário ${userId}:`, status)
            return status
        } catch (error) {
            console.error(`Erro ao verificar status de representante para usuário ${userId}:`, error.message)
            throw new Error(`Erro ao verificar status de representante: ${error.message}`)
        }
    }

    /**
     * Gerencia permissões após remoção de um tipo de representante
     * @param {number} userId - ID do usuário
     * @param {string} representativeType - Tipo de representante removido
     */
    async managePermissionsAfterRepresentativeRemoval(userId, representativeType) {
        try {
            await this.removeRepresentativePermissions(userId, representativeType)
        } catch (error) {
            console.error(`Erro ao gerenciar permissões após remoção de ${representativeType} para usuário ${userId}:`, error.message)
            throw new Error(`Erro ao gerenciar permissões: ${error.message}`)
        }
    }

    /**
     * Cria permissões para cliente
     * @param {number} userId - ID do usuário
     * @param {string} uid - UID do usuário
     */
    async createClientePermissions(userId, uid) {
        const permissoesCliente = [1, 2, 3, 4, 5, 6, 9]
        await this.addPermissionsToUser(userId, uid, permissoesCliente)
    }

    /**
     * Busca permissões de um usuário
     * @param {string} uid - UID do usuário
     * @returns {Promise<Array>} Lista de permissões
     */
    async getUserPermissions(uid) {
        return await this.repository.getUserPermissions(uid)
    }

    /**
     * Verifica se um usuário tem uma permissão específica
     * @param {string} uid - UID do usuário
     * @param {number} permissionId - ID da permissão
     * @returns {Promise<boolean>} True se tem a permissão
     */
    async hasPermission(uid, permissionId) {
        return await this.repository.hasPermission(uid, permissionId)
    }
}

module.exports = PermissaoService
