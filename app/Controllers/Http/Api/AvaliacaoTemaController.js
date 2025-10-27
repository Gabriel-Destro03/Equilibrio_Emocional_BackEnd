'use strict'

const AvaliacaoTemaService = require('../../../Services/AvaliacaoTemaService')
const AvaliacaoTemaFacade = require('../../../Facades/AvaliacaoTemaFacade')

class AvaliacaoTemaController {
    constructor() {
        this.service = new AvaliacaoTemaService()
        this.facade = new AvaliacaoTemaFacade()
        
        // Inicializa os services no facade
        this.facade.initializeServices(this.service)
    }

    /**
     * Lista todas as avaliações de temas
     */
    async index({ response }) {
        try {
            const avaliacoes = await this.service.getAllAvaliacoesTemas()
            return response.status(200).json(avaliacoes)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca uma avaliação de tema específica
     */
    async show({ params, response }) {
        try {
            const avaliacao = await this.service.getAvaliacaoTemaById(params.id)
            return response.status(200).json(avaliacao)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca avaliações de temas por departamentoId
     * Endpoint principal solicitado pelo usuário
     */
    async getByDepartamentoId({ params, response }) {
        try {
            const departamentoId = parseInt(params.departamentoId)
            
            if (isNaN(departamentoId)) {
                return response.status(400).json({ 
                    error: 'ID do departamento deve ser um número válido' 
                })
            }

            // Busca apenas os dados do banco
            const avaliacoes = await this.service.getAvaliacoesTemasByDepartamentoId(departamentoId)
            return response.status(200).json(avaliacoes)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca avaliações de temas por departamentoId com filtro de data (mais de 5 dias)
     * Endpoint principal solicitado pelo usuário com filtro de data
     */
    async getByDepartamentoIdWithDateFilter({ params, response }) {
        try {
            const departamentoId = parseInt(params.departamentoId)
            
            if (isNaN(departamentoId)) {
                return response.status(400).json({ 
                    error: 'ID do departamento deve ser um número válido' 
                })
            }

            // Delega toda a lógica de negócio para o facade
            const resultado = await this.facade.buscarAvaliacoesTemasPorDepartamentoComFiltroData(departamentoId)
            
            return response.status(200).json(resultado)
        } catch (error) {
            console.error('Erro no controller:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca avaliações de temas por departamentoId com opção de filtro de data
     * Endpoint flexível que permite escolher se aplica o filtro de data
     */
    async getByDepartamentoIdFlexible({ params, request, response }) {
        try {
            const departamentoId = parseInt(params.departamentoId)
            const { aplicar_filtro_data } = request.only(['aplicar_filtro_data'])
            
            if (isNaN(departamentoId)) {
                return response.status(400).json({ 
                    error: 'ID do departamento deve ser um número válido' 
                })
            }

            const aplicarFiltro = aplicar_filtro_data === true || aplicar_filtro_data === 'true'
            const resultado = await this.facade.buscarAvaliacoesTemasCompleto(departamentoId, aplicarFiltro)
            
            return response.status(200).json(resultado)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Cria uma nova avaliação de tema
     */
    async store({ request, response }) {
        try {
            const avaliacaoData = request.only([
                'departamento_id', 
                'tema', 
                'avaliacao', 
                'observacoes'
            ])
            
            const avaliacao = await this.facade.criarAvaliacaoTemaCompleto(avaliacaoData)
            return response.status(201).json(avaliacao)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Atualiza uma avaliação de tema existente
     */
    async update({ params, request, response }) {
        try {
            const avaliacaoData = request.only([
                'tema', 
                'avaliacao', 
                'observacoes'
            ])
            
            const avaliacao = await this.facade.atualizarAvaliacaoTemaCompleto(params.id, avaliacaoData)
            return response.status(200).json(avaliacao)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Remove uma avaliação de tema
     */
    async destroy({ params, response }) {
        try {
            const resultado = await this.facade.removerAvaliacaoTemaCompleto(params.id)
            return response.status(200).json(resultado)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Força atualização de avaliações via n8n para um departamento específico
     */
    async forcarAtualizacaoN8n({ params, response }) {
        try {
            const departamentoId = parseInt(params.departamentoId)
            
            if (isNaN(departamentoId)) {
                return response.status(400).json({ 
                    error: 'ID do departamento deve ser um número válido' 
                })
            }

            const resultado = await this.facade.forcarAtualizacaoN8n(departamentoId)
            return response.status(200).json(resultado)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = AvaliacaoTemaController
