'use strict'

const IService = require('./IService')

/**
 * Interface para serviços de Avaliação de Tema
 */
class IAvaliacaoTemaService extends IService {
    constructor() {
        super()
    }

    /**
     * Busca avaliações de temas por departamentoId
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Array>} Lista de avaliações de temas
     */
    async getAvaliacoesTemasByDepartamentoId(departamentoId) {
        throw new Error('Método getAvaliacoesTemasByDepartamentoId deve ser implementado')
    }

    /**
     * Busca avaliações de temas por departamentoId com filtro de data (mais de 5 dias)
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Array>} Lista de avaliações de temas com mais de 5 dias
     */
    async getAvaliacoesTemasByDepartamentoIdWithDateFilter(departamentoId) {
        throw new Error('Método getAvaliacoesTemasByDepartamentoIdWithDateFilter deve ser implementado')
    }

    /**
     * Valida dados da avaliação de tema
     * @param {Object} avaliacaoData - Dados da avaliação
     * @param {boolean} isUpdate - Se é uma atualização
     */
    async validateAvaliacaoTemaData(avaliacaoData, isUpdate = false) {
        throw new Error('Método validateAvaliacaoTemaData deve ser implementado')
    }
}

module.exports = IAvaliacaoTemaService
