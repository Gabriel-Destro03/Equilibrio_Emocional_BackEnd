'use strict'

const JornadaService = require('../../../Services/JornadaService')
const JornadaComentarioFacade = require('../../../Facades/JornadaComentarioFacade')

class JornadaComentarioController {
    constructor() {
        this.service = new JornadaService()
        this.facade = new JornadaComentarioFacade()
        
        // Inicializa os services no facade
        this.facade.initializeServices(this.service)
    }

    /**
     * Busca comentários de jornadas por departamento
     */
    async getByDepartamentoId({ params, response }) {
        try {
            const departamentoId = parseInt(params.departamentoId)
            
            if (isNaN(departamentoId)) {
                return response.status(400).json({ 
                    error: 'ID do departamento deve ser um número válido' 
                })
            }

            // Delega toda a lógica de negócio para o facade
            const resultado = await this.facade.buscarComentariosPorDepartamento(departamentoId)
            
            return response.status(200).json(resultado)
        } catch (error) {
            console.error('Erro no controller:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca comentários de jornadas por departamento com filtros opcionais
     */
    async getByDepartamentoIdComFiltros({ params, request, response }) {
        try {
            const departamentoId = parseInt(params.departamentoId)
            
            if (isNaN(departamentoId)) {
                return response.status(400).json({ 
                    error: 'ID do departamento deve ser um número válido' 
                })
            }

            // Extrai filtros da query string
            const filtros = request.only(['data_inicio', 'data_fim', 'limit', 'offset'])
            
            // Converte limit e offset para números se existirem
            if (filtros.limit) filtros.limit = parseInt(filtros.limit)
            if (filtros.offset) filtros.offset = parseInt(filtros.offset)

            // Delega toda a lógica de negócio para o facade
            const resultado = await this.facade.buscarComentariosPorDepartamentoComFiltros(departamentoId, filtros)
            
            return response.status(200).json(resultado)
        } catch (error) {
            console.error('Erro no controller:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = JornadaComentarioController

