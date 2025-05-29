'use strict'

const FilialService = require('../../../Services/FilialService')

class FilialController {
    constructor() {
        this.service = new FilialService()
    }

    /**
     * Lista todas as filiais ativas
     */
    async index({ response }) {
        try {
            const filiais = await this.service.getAllFiliais()
            return response.status(200).json(filiais)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca uma filial específica
     */
    async show({ params, response }) {
        try {
            const filial = await this.service.getFilialById(params.id)
            return response.status(200).json(filial)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Cria uma nova filial
     */
    async store({ request, response }) {
        try {
            const filialData = request.only(['nome_filial', 'cnpj', 'endereco'])
            const filial = await this.service.createFilial(filialData)
            return response.status(201).json(filial)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Atualiza uma filial existente
     */
    async update({ params, request, response }) {
        try {
            const filialData = request.only(['nome_filial', 'cnpj', 'endereco'])
            const filial = await this.service.updateFilial(params.id, filialData)
            return response.status(200).json(filial)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Inativa uma filial
     */
    async destroy({ params, response }) {
        try {
            await this.service.inactivateFilial(params.id)
            return response.status(200).json({ message: 'Filial inativada com sucesso' })
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Altera o status da filial
     */
    async changeStatus({ params, response }) {
        try {
            const filial = await this.service.getFilialById(params.id)
            if (!filial) {
                return response.status(404).json({ error: 'Filial não encontrada' })
            }

            const novoStatus = !filial.status
            const filialAtualizada = await this.service.changeStatus(params.id, novoStatus)
            return response.status(200).json(filialAtualizada)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = FilialController 