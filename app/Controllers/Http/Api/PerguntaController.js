'use strict'

const PerguntaService = require('../../../Services/PerguntaService')

class PerguntaController {
    constructor() {
        this.service = new PerguntaService()
    }

    /**
     * Lista todas as perguntas ativas
     */
    async index({ response }) {
        try {
            const perguntas = await this.service.getAllPerguntas()
            return response.status(200).json(perguntas)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca uma pergunta específica
     */
    async show({ params, response }) {
        try {
            const pergunta = await this.service.getPerguntaById(params.id)
            return response.status(200).json(pergunta)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Cria uma nova pergunta
     */
    async store({ request, response }) {
        try {
            const perguntaData = request.only(['descricao', 'categoria'])
            const pergunta = await this.service.createPergunta(perguntaData)
            return response.status(201).json(pergunta)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Atualiza uma pergunta existente
     */
    async update({ params, request, response }) {
        try {
            const perguntaData = request.only(['descricao', 'categoria', 'status'])
            const pergunta = await this.service.updatePergunta(params.id, perguntaData)
            return response.status(200).json(pergunta)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Inativa uma pergunta
     */
    async destroy({ params, response }) {
        try {
            await this.service.inactivatePergunta(params.id)
            return response.status(200).json({ message: 'Pergunta inativada com sucesso' })
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = PerguntaController 