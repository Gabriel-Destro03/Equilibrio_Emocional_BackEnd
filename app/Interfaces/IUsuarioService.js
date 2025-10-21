'use strict'

const IService = require('./IService')

/**
 * Interface para o service de usuários
 * Estende IService e adiciona métodos específicos de usuário
 */
class IUsuarioService extends IService {
    /**
     * Busca usuário por UID
     * @param {string} uid - UID do usuário
     * @returns {Promise<Object>} Usuário encontrado
     */
    async getByUid(uid) {
        throw new Error('Método getByUid deve ser implementado')
    }

    /**
     * Busca usuário por email
     * @param {string} email - Email do usuário
     * @returns {Promise<Object>} Usuário encontrado
     */
    async getByEmail(email) {
        throw new Error('Método getByEmail deve ser implementado')
    }

    /**
     * Busca usuários por empresa com filtros de permissão
     * @param {Object} request - Request com dados do usuário logado
     * @returns {Promise<Array>} Lista de usuários
     */
    async getUsuariosByEmpresa(request) {
        throw new Error('Método getUsuariosByEmpresa deve ser implementado')
    }

    /**
     * Busca usuários por filial
     * @param {string} uid - UID do usuário
     * @returns {Promise<Array>} Lista de usuários da filial
     */
    async getUsuariosByFilial(uid) {
        throw new Error('Método getUsuariosByFilial deve ser implementado')
    }

    /**
     * Valida dados de usuário antes de criar/atualizar
     * @param {Object} usuarioData - Dados do usuário
     * @param {boolean} isUpdate - Se é uma atualização
     * @returns {Promise<void>}
     */
    async validateUsuarioData(usuarioData, isUpdate = false) {
        throw new Error('Método validateUsuarioData deve ser implementado')
    }

    /**
     * Gera senha temporária para usuário
     * @param {Object} usuarioData - Dados do usuário
     * @returns {Promise<string>} Senha gerada
     */
    async generateTemporaryPassword(usuarioData) {
        throw new Error('Método generateTemporaryPassword deve ser implementado')
    }

    /**
     * Envia email de boas-vindas para usuário
     * @param {string} email - Email do usuário
     * @param {string} resetLink - Link de reset
     * @param {string} code - Código de ativação
     * @returns {Promise<void>}
     */
    async sendWelcomeEmail(email, resetLink, code) {
        throw new Error('Método sendWelcomeEmail deve ser implementado')
    }

    /**
     * Cria token de ativação para usuário
     * @param {Object} usuarioData - Dados do usuário
     * @returns {Promise<Object>} Dados do token criado
     */
    async createActivationToken(usuarioData) {
        throw new Error('Método createActivationToken deve ser implementado')
    }
}

module.exports = IUsuarioService
