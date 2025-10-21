'use strict'

const IService = require('./IService')

/**
 * Interface para o service de relacionamento usuário-departamento
 * Estende IService e adiciona métodos específicos
 */
class IUsuarioDepartamentoService extends IService {
    /**
     * Busca representantes por departamento
     * @param {Object} request - Request com dados do usuário
     * @param {number} idDepartamento - ID do departamento
     * @returns {Promise<Array>} Lista de representantes
     */
    async getRepresentantesByDepartamento(request, idDepartamento) {
        throw new Error('Método getRepresentantesByDepartamento deve ser implementado')
    }

    /**
     * Busca representantes por ID do usuário e departamento
     * @param {number} idUsuario - ID do usuário
     * @param {number} idDepartamento - ID do departamento
     * @returns {Promise<void>}
     */
    async getRepresentantesByIdUsuario(idUsuario, idDepartamento) {
        throw new Error('Método getRepresentantesByIdUsuario deve ser implementado')
    }

    /**
     * Atualiza relacionamento usuário-departamento
     * @param {number} idUsuario - ID do usuário
     * @param {number} idDepartamento - ID do departamento
     * @param {boolean} isRepresentante - Se é representante
     * @returns {Promise<Object>} Relacionamento atualizado
     */
    async updateUsuarioDepartamento(idUsuario, idDepartamento, isRepresentante) {
        throw new Error('Método updateUsuarioDepartamento deve ser implementado')
    }

    /**
     * Remove relacionamento usuário-departamento
     * @param {number} idUsuario - ID do usuário
     * @param {number} idDepartamento - ID do departamento
     * @returns {Promise<void>}
     */
    async deleteUsuarioDepartamento(idUsuario, idDepartamento) {
        throw new Error('Método deleteUsuarioDepartamento deve ser implementado')
    }

    /**
     * Valida dados de relacionamento antes de criar/atualizar
     * @param {Object} relacionamentoData - Dados do relacionamento
     * @param {boolean} isUpdate - Se é uma atualização
     * @returns {Promise<void>}
     */
    async validateRelacionamentoData(relacionamentoData, isUpdate = false) {
        throw new Error('Método validateRelacionamentoData deve ser implementado')
    }

    /**
     * Gerencia permissões após mudança de representante
     * @param {number} idUsuario - ID do usuário
     * @param {boolean} isRepresentante - Se é representante
     * @returns {Promise<void>}
     */
    async manageRepresentativePermissions(idUsuario, isRepresentante) {
        throw new Error('Método manageRepresentativePermissions deve ser implementado')
    }

    /**
     * Verifica se usuário pode ser representante do departamento
     * @param {number} idUsuario - ID do usuário
     * @param {number} idDepartamento - ID do departamento
     * @returns {Promise<boolean>} Se pode ser representante
     */
    async canBeRepresentative(idUsuario, idDepartamento) {
        throw new Error('Método canBeRepresentative deve ser implementado')
    }
}

module.exports = IUsuarioDepartamentoService
