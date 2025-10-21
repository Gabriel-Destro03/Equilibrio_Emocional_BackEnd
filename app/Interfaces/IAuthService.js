'use strict'

/**
 * Interface para o service de autenticação
 * Define métodos para autenticação, criação de usuários e recuperação de senha
 */
class IAuthService {
    /**
     * Autentica usuário e retorna dados com token
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Dados do usuário com token
     */
    async login(email, password) {
        throw new Error('Método login deve ser implementado')
    }

    /**
     * Cria um novo usuário no sistema de autenticação
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Dados do usuário criado
     */
    async signUp(email, password) {
        throw new Error('Método signUp deve ser implementado')
    }

    /**
     * Ativa usuário no sistema de autenticação
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Dados do usuário ativado
     */
    async activeUser(email, password) {
        throw new Error('Método activeUser deve ser implementado')
    }

    /**
     * Faz logout do usuário
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Resultado do logout
     */
    async logout(token) {
        throw new Error('Método logout deve ser implementado')
    }

    /**
     * Processa solicitação de recuperação de senha
     * @param {string} email - Email do usuário
     * @returns {Promise<Object>} Resultado da operação
     */
    async forgotPassword(email) {
        throw new Error('Método forgotPassword deve ser implementado')
    }

    /**
     * Valida token de reset de senha
     * @param {string} token - Token para validar
     * @returns {Promise<Object>} Resultado da validação
     */
    async validateResetToken(token) {
        throw new Error('Método validateResetToken deve ser implementado')
    }

    /**
     * Valida token e código de reset de senha
     * @param {string} token - Token para validar
     * @param {string} code - Código para validar
     * @returns {Promise<Object>} Resultado da validação
     */
    async validateResetCode(token, code) {
        throw new Error('Método validateResetCode deve ser implementado')
    }

    /**
     * Redefine senha do usuário
     * @param {string} token - Token para validar
     * @param {string} uid - ID do usuário
     * @param {string} code - Código para validar
     * @param {string} newPassword - Nova senha
     * @returns {Promise<Object>} Resultado do reset
     */
    async resetPassword(token, uid, code, newPassword) {
        throw new Error('Método resetPassword deve ser implementado')
    }

    /**
     * Reenvia email de ativação
     * @param {string} uid - ID do usuário
     * @returns {Promise<Object>} Resultado do reenvio
     */
    async resendActivationEmail(uid) {
        throw new Error('Método resendActivationEmail deve ser implementado')
    }

    /**
     * Define senha do usuário
     * @param {string} token - Token para validar
     * @param {string} uid - ID do usuário
     * @param {string} code - Código para validar
     * @param {string} currentPassword - Senha atual
     * @param {string} newPassword - Nova senha
     * @returns {Promise<Object>} Resultado da definição
     */
    async definePassword(token, uid, code, currentPassword, newPassword) {
        throw new Error('Método definePassword deve ser implementado')
    }

    /**
     * Verifica código de acesso para ativação de cliente
     * @param {string} code - Código para validar
     * @returns {Promise<Object>} Resultado da verificação
     */
    async verifyAccessCode(code) {
        throw new Error('Método verifyAccessCode deve ser implementado')
    }

    /**
     * Formata dados de filiais
     * @param {Array} filiais - Dados brutos de filiais
     * @returns {Array} Dados formatados de filiais
     */
    formatFiliaisData(filiais) {
        throw new Error('Método formatFiliaisData deve ser implementado')
    }

    /**
     * Prepara dados do token
     * @param {Object} usuario - Dados do usuário
     * @param {Array} userPerm - Permissões do usuário
     * @returns {Object} Dados do token
     */
    prepareTokenData(usuario, userPerm) {
        throw new Error('Método prepareTokenData deve ser implementado')
    }

    /**
     * Prepara resposta de login
     * @param {Object} usuario - Dados do usuário
     * @param {Array} userPerm - Permissões do usuário
     * @param {Array} filiaisFormatadas - Filiais formatadas
     * @param {Object} tokenInfo - Informações do token
     * @param {Object} authData - Dados de autenticação
     * @returns {Object} Resposta formatada
     */
    prepareLoginResponse(usuario, userPerm, filiaisFormatadas, tokenInfo, authData) {
        throw new Error('Método prepareLoginResponse deve ser implementado')
    }
}

module.exports = IAuthService
