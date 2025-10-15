'use strict'

const IService = require('./IService')

/**
 * Interface para o service de departamentos
 * Estende IService e adiciona métodos específicos de departamento
 */
class IDepartamentoService extends IService {
    /**
     * Busca departamentos por filial
     * @param {number|string} filialId - ID da filial
     * @returns {Promise<Array>} Lista de departamentos da filial
     */
    async getDepartamentosByFilial(filialId) {
        throw new Error('Método getDepartamentosByFilial deve ser implementado')
    }

    /**
     * Busca departamentos por empresa
     * @param {number|string} empresaId - ID da empresa
     * @returns {Promise<Array>} Lista de departamentos da empresa
     */
    async getByEmpresaId(empresaId) {
        throw new Error('Método getByEmpresaId deve ser implementado')
    }

    /**
     * Busca departamentos por usuário
     * @param {string} uid - UID do usuário
     * @returns {Promise<Array>} Lista de departamentos do usuário
     */
    async getDepartamentosByUserId(uid) {
        throw new Error('Método getDepartamentosByUserId deve ser implementado')
    }

    /**
     * Valida dados de departamento antes de criar/atualizar
     * @param {Object} departamentoData - Dados do departamento
     * @param {boolean} isUpdate - Se é uma atualização
     * @returns {Promise<void>}
     */
    async validateDepartamentoData(departamentoData, isUpdate = false) {
        throw new Error('Método validateDepartamentoData deve ser implementado')
    }

    /**
     * Verifica se a filial pertence à empresa informada
     * @param {number|string} filialId - ID da filial
     * @param {number|string} empresaId - ID da empresa
     * @returns {Promise<boolean>} Se a filial pertence à empresa
     */
    async validateFilialBelongsToEmpresa(filialId, empresaId) {
        throw new Error('Método validateFilialBelongsToEmpresa deve ser implementado')
    }
}

module.exports = IDepartamentoService
