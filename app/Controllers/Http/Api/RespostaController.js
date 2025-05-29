'use strict'

const RespostaService = require('../../../Services/RespostaService')

class RespostaController {
    constructor() {
        this.service = new RespostaService()
    }

    /**
     * Lista todas as respostas ativas
     */
    async index({ response }) {
        try {
            const respostas = await this.service.getAllRespostas()
            return response.status(200).json(respostas)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca uma resposta específica
     */
    async show({ params, response }) {
        try {
            const resposta = await this.service.getRespostaById(params.id)
            return response.status(200).json(resposta)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Lista todas as respostas de uma pergunta específica
     */
    async getByPergunta({ params, response }) {
        try {
            const respostas = await this.service.getRespostasByPerguntaId(params.perguntaId)
            return response.status(200).json(respostas)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Cria uma nova resposta
     */
    async store({ request, response }) {
        try {
            const respostaData = request.only(['descricao', 'id_pergunta'])
            const resposta = await this.service.createResposta(respostaData)
            return response.status(201).json(resposta)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Atualiza uma resposta existente
     */
    async update({ params, request, response }) {
        try {
            const respostaData = request.only(['descricao', 'id_pergunta', 'status'])
            const resposta = await this.service.updateResposta(params.id, respostaData)
            return response.status(200).json(resposta)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Inativa uma resposta
     */
    async destroy({ params, response }) {
        try {
            await this.service.inactivateResposta(params.id)
            return response.status(200).json({ message: 'Resposta inativada com sucesso' })
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = RespostaController 