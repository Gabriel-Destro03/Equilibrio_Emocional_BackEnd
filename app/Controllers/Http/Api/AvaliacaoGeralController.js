'use strict'

const AvaliacaoGeralService = require('../../../Services/AvaliacaoGeralService')

class AvaliacaoGeralController {
    constructor() {
        this.service = new AvaliacaoGeralService()
    }

    async getUltimaPorDepartamento({ params, response }) {
        try {
            const { departamentoId } = params
            const data = await this.service.getUltimaPorDepartamento(departamentoId)
            return response.status(200).json(data)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = AvaliacaoGeralController


