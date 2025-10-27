'use strict'

const JornadaService = require('../Services/JornadaService')
const DepartamentoService = require('../Services/DepartamentoService')

/**
 * Facade para operações relacionadas a comentários de jornadas (questionários)
 * Centraliza a lógica de negócio para buscar reflexões e emoções dos questionários
 */
class JornadaComentarioFacade {
    constructor() {
        this.jornadaService = null
        this.departamentoService = new DepartamentoService()
    }

    /**
     * Inicializa os services necessários
     * @param {JornadaService} jornadaService
     */
    initializeServices(jornadaService) {
        this.jornadaService = jornadaService
    }

    /**
     * Busca comentários de jornadas por departamento
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Object>} Comentários das jornadas com informações do departamento
     */
    async buscarComentariosPorDepartamento(departamentoId) {
        this._validateServices()

        try {
            // Busca os comentários usando o service
            const comentarios = await this.jornadaService.getComentariosByDepartamentoId(departamentoId)
            return comentarios
           
            
            return {
                departamento_id: departamentoId,
                departamento_nome: departamento ? departamento.nome_departamento : 'Desconhecido',
                total_comentarios: comentarios.length,
                comentarios: comentarios,
                data_busca: new Date().toISOString()
            }
        } catch (error) {
            throw new Error(`Erro ao buscar comentários por departamento: ${error.message}`)
        }
    }

    /**
     * Busca comentários de jornadas por departamento com filtros adicionais
     * @param {number} departamentoId - ID do departamento
     * @param {Object} filtros - Filtros opcionais (data_inicio, data_fim, limit, offset)
     * @returns {Promise<Object>} Comentários filtrados
     */
    async buscarComentariosPorDepartamentoComFiltros(departamentoId, filtros = {}) {
        this._validateServices()

        try {
            const comentarios = await this.jornadaService.getComentariosByDepartamentoIdComFiltros(departamentoId, filtros)
            
            const departamento = await this.departamentoService.getById(departamentoId)
            
            return {
                departamento_id: departamentoId,
                departamento_nome: departamento ? departamento.nome_departamento : 'Desconhecido',
                total_comentarios: comentarios.length,
                filtros_aplicados: filtros,
                comentarios: comentarios,
                data_busca: new Date().toISOString()
            }
        } catch (error) {
            throw new Error(`Erro ao buscar comentários com filtros: ${error.message}`)
        }
    }

    /**
     * Valida se os services foram inicializados
     * @private
     */
    _validateServices() {
        if (!this.jornadaService) {
            throw new Error('Services não foram inicializados. Chame initializeServices() primeiro.')
        }
    }
}

module.exports = JornadaComentarioFacade

