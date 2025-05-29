'use strict'

const JornadaService = require('../../../Services/JornadaService')

class JornadaController {
    constructor() {
        this.service = new JornadaService()
    }

    /**
     * Lista todas as jornadas ativas
     */
    async index({ response }) {
        try {
            const jornadas = await this.service.getAllJornadas()
            return response.status(200).json(jornadas)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca uma jornada específica
     */
    async show({ params, response }) {
        try {
            const jornada = await this.service.getJornadaById(params.id)
            return response.status(200).json(jornada)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Cria uma nova jornada
     */
    async store({ request, response }) {
        try {
            const jornadaData = request.only(['emocao', 'reflexao', 'uid', 'respostas'])
            const jornada = await this.service.createJornada(jornadaData)
            return response.status(201).json(jornada)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Atualiza uma jornada existente
     */
    async update({ params, request, response }) {
        try {
            const jornadaData = request.only(['emocao', 'reflexao', 'respostas'])
            const jornada = await this.service.updateJornada(params.id, jornadaData)
            return response.status(200).json(jornada)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = JornadaController 