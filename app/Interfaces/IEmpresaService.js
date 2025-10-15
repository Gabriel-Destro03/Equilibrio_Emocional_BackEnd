'use strict'

const IService = require('./IService')

/**
 * Interface para o service de empresas
 * Estende IService e adiciona métodos específicos de empresa
 */
class IEmpresaService extends IService {
    /**
     * Busca empresa por CNPJ
     * @param {string} cnpj - CNPJ da empresa
     * @returns {Promise<Object|null>} Empresa encontrada ou null
     */
    async getByCnpj(cnpj) {
        throw new Error('Método getByCnpj deve ser implementado')
    }

    /**
     * Busca representantes de uma empresa
     * @param {number|string} empresaId - ID da empresa
     * @returns {Promise<Array>} Lista de representantes
     */
    async getRepresentantesByEmpresaId(empresaId) {
        throw new Error('Método getRepresentantesByEmpresaId deve ser implementado')
    }

    /**
     * Busca empresas com suas filiais e departamentos
     * @returns {Promise<Array>} Lista de empresas com estrutura hierárquica
     */
    async getEmpresaFiliaisDepartamentos() {
        throw new Error('Método getEmpresaFiliaisDepartamentos deve ser implementado')
    }

    /**
     * Busca uma empresa específica com suas filiais e departamentos
     * @param {number|string} empresaId - ID da empresa
     * @returns {Promise<Object>} Empresa com estrutura hierárquica
     */
    async getEmpresaFiliaisDepartamentosByEmpresaId(empresaId) {
        throw new Error('Método getEmpresaFiliaisDepartamentosByEmpresaId deve ser implementado')
    }

    /**
     * Valida dados de empresa antes de criar/atualizar
     * @param {Object} empresaData - Dados da empresa
     * @param {boolean} isUpdate - Se é uma atualização
     * @returns {Promise<void>}
     */
    async validateEmpresaData(empresaData, isUpdate = false) {
        throw new Error('Método validateEmpresaData deve ser implementado')
    }

    /**
     * Gerencia representantes de uma empresa
     * @param {number|string} empresaId - ID da empresa
     * @param {Array} representantes - Lista de representantes
     * @returns {Promise<void>}
     */
    async manageRepresentantes(empresaId, representantes) {
        throw new Error('Método manageRepresentantes deve ser implementado')
    }
}

module.exports = IEmpresaService
