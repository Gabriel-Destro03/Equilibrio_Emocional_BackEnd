'use strict'

const ClienteService = require('../../../Services/ClienteService')

class ClienteController {
    constructor() {
        this.service = new ClienteService()
    }

    /**
     * Cadastra um novo cliente
     */
    async store({ request, response }) {
        try {
            const { usuario, empresa } = request.only(['usuario', 'empresa'])
            
            const cliente = await this.service.createCliente({ usuario, empresa })
            return response.status(201).json(cliente)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = ClienteController 