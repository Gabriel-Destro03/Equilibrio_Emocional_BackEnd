'use strict'

const IService = require('./IService')

/**
 * Interface para o service de clientes
 * Estende IService e adiciona métodos específicos de cliente
 */
class IClienteService extends IService {
    /**
     * Valida dados de cliente antes de criar/atualizar
     * @param {Object} clienteData - Dados do cliente
     * @param {boolean} isUpdate - Se é uma atualização
     * @returns {Promise<void>}
     */
    async validateClienteData(clienteData, isUpdate = false) {
        throw new Error('Método validateClienteData deve ser implementado')
    }

    /**
     * Verifica se cliente já existe por email
     * @param {string} email - Email do cliente
     * @returns {Promise<boolean>} Se cliente existe
     */
    async clienteExistsByEmail(email) {
        throw new Error('Método clienteExistsByEmail deve ser implementado')
    }

    /**
     * Verifica se empresa já existe por CNPJ
     * @param {string} cnpj - CNPJ da empresa
     * @returns {Promise<boolean>} Se empresa existe
     */
    async empresaExistsByCnpj(cnpj) {
        throw new Error('Método empresaExistsByCnpj deve ser implementado')
    }

    /**
     * Cria empresa associada ao cliente
     * @param {Object} empresaData - Dados da empresa
     * @returns {Promise<Object>} Empresa criada
     */
    async createEmpresaForCliente(empresaData) {
        throw new Error('Método createEmpresaForCliente deve ser implementado')
    }

    /**
     * Cria usuário de autenticação para cliente
     * @param {string} email - Email do cliente
     * @param {string} password - Senha do cliente
     * @returns {Promise<Object>} Dados de autenticação
     */
    async createAuthUserForCliente(email, password) {
        throw new Error('Método createAuthUserForCliente deve ser implementado')
    }

    /**
     * Cria usuário principal para cliente
     * @param {Object} usuarioData - Dados do usuário
     * @returns {Promise<Object>} Usuário criado
     */
    async createUsuarioForCliente(usuarioData) {
        throw new Error('Método createUsuarioForCliente deve ser implementado')
    }

    /**
     * Cria representante da empresa
     * @param {number} usuarioId - ID do usuário
     * @param {string} usuarioUid - UID do usuário
     * @param {number} empresaId - ID da empresa
     * @returns {Promise<void>}
     */
    async createRepresentanteForCliente(usuarioId, usuarioUid, empresaId) {
        throw new Error('Método createRepresentanteForCliente deve ser implementado')
    }

    /**
     * Gera e envia código de acesso para cliente
     * @param {string} email - Email do cliente
     * @param {string} nome - Nome do cliente
     * @param {string} codigo - Código de acesso
     * @returns {Promise<void>}
     */
    async sendAccessCodeToCliente(email, nome, codigo) {
        throw new Error('Método sendAccessCodeToCliente deve ser implementado')
    }

    /**
     * Cria permissões para cliente
     * @param {number} usuarioId - ID do usuário
     * @param {string} usuarioUid - UID do usuário
     * @returns {Promise<void>}
     */
    async createPermissaoForCliente(usuarioId, usuarioUid) {
        throw new Error('Método createPermissaoForCliente deve ser implementado')
    }

    /**
     * Atualiza dados do usuário do cliente
     * @param {number} clienteId - ID do cliente
     * @param {Object} usuarioData - Dados do usuário
     * @returns {Promise<Object>} Usuário atualizado
     */
    async updateClienteUsuario(clienteId, usuarioData) {
        throw new Error('Método updateClienteUsuario deve ser implementado')
    }

    /**
     * Atualiza dados da empresa do cliente
     * @param {number} clienteId - ID do cliente
     * @param {Object} empresaData - Dados da empresa
     * @returns {Promise<Object>} Empresa atualizada
     */
    async updateClienteEmpresa(clienteId, empresaData) {
        throw new Error('Método updateClienteEmpresa deve ser implementado')
    }
}

module.exports = IClienteService
