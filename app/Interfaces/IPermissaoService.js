'use strict'

const IService = require('./IService')

/**
 * Interface para o service de permissões
 * Estende IService e adiciona métodos específicos de permissões
 */
class IPermissaoService extends IService {
    /**
     * Adiciona permissões para um usuário
     * @param {number} userId - ID do usuário
     * @param {string} uid - UID do usuário
     * @param {Array} permissionIds - IDs das permissões
     * @returns {Promise<void>}
     */
    async addPermissionsToUser(userId, uid, permissionIds) {
        throw new Error('Método addPermissionsToUser deve ser implementado')
    }

    /**
     * Adiciona permissões baseadas no tipo de representante
     * @param {number} userId - ID do usuário
     * @param {string} uid - UID do usuário
     * @param {string} representativeType - Tipo de representante
     * @returns {Promise<void>}
     */
    async addRepresentativePermissions(userId, uid, representativeType) {
        throw new Error('Método addRepresentativePermissions deve ser implementado')
    }

    /**
     * Obtém permissões de um tipo de representante
     * @param {string} representativeType - Tipo de representante
     * @returns {Array} Array de IDs das permissões
     */
    getRepresentativePermissions(representativeType) {
        throw new Error('Método getRepresentativePermissions deve ser implementado')
    }

    /**
     * Remove permissões específicas de um usuário
     * @param {number} userId - ID do usuário
     * @param {Array} permissionIds - IDs das permissões
     * @returns {Promise<void>}
     */
    async removePermissionsFromUser(userId, permissionIds) {
        throw new Error('Método removePermissionsFromUser deve ser implementado')
    }

    /**
     * Verifica permissões necessárias para um usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Array>} Array de IDs das permissões necessárias
     */
    async getRequiredPermissionsForUser(userId) {
        throw new Error('Método getRequiredPermissionsForUser deve ser implementado')
    }

    /**
     * Remove permissões de um tipo de representante
     * @param {number} userId - ID do usuário
     * @param {string} representativeType - Tipo de representante
     * @returns {Promise<void>}
     */
    async removeRepresentativePermissions(userId, representativeType) {
        throw new Error('Método removeRepresentativePermissions deve ser implementado')
    }

    /**
     * Verifica status de representante de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Status de representante
     */
    async checkUserRepresentativeStatus(userId) {
        throw new Error('Método checkUserRepresentativeStatus deve ser implementado')
    }

    /**
     * Gerencia permissões após remoção de representante
     * @param {number} userId - ID do usuário
     * @param {string} representativeType - Tipo de representante
     * @returns {Promise<void>}
     */
    async managePermissionsAfterRepresentativeRemoval(userId, representativeType) {
        throw new Error('Método managePermissionsAfterRepresentativeRemoval deve ser implementado')
    }

    /**
     * Cria permissões para cliente
     * @param {number} userId - ID do usuário
     * @param {string} uid - UID do usuário
     * @returns {Promise<void>}
     */
    async createClientePermissions(userId, uid) {
        throw new Error('Método createClientePermissions deve ser implementado')
    }

    /**
     * Busca permissões de um usuário
     * @param {string} uid - UID do usuário
     * @returns {Promise<Array>} Lista de permissões
     */
    async getUserPermissions(uid) {
        throw new Error('Método getUserPermissions deve ser implementado')
    }

    /**
     * Verifica se um usuário tem uma permissão específica
     * @param {string} uid - UID do usuário
     * @param {number} permissionId - ID da permissão
     * @returns {Promise<boolean>} True se tem a permissão
     */
    async hasPermission(uid, permissionId) {
        throw new Error('Método hasPermission deve ser implementado')
    }
}

module.exports = IPermissaoService
