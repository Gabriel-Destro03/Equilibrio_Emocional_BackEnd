'use strict'

const EmailLogService = use('App/Services/EmailLogService')

class EmailLogController {
    constructor() {
        this.service = new EmailLogService()
    }

    /**
     * Lista todos os logs de e-mail com paginação
     */
    async index({ request, response }) {
        try {
            const page = parseInt(request.input('page', 1))
            const limit = parseInt(request.input('limit', 50))
            
            const logs = await this.service.getAllEmailLogs(page, limit)
            return response.status(200).json(logs)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca logs de e-mail por status
     */
    async getByStatus({ params, response }) {
        try {
            const logs = await this.service.getEmailLogsByStatus(params.status)
            return response.status(200).json(logs)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca logs de e-mail por tipo
     */
    async getByType({ params, response }) {
        try {
            const logs = await this.service.getEmailLogsByType(params.type)
            return response.status(200).json(logs)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca logs de e-mail por usuário
     */
    async getByUser({ params, response }) {
        try {
            const logs = await this.service.getEmailLogsByUser(params.userId)
            return response.status(200).json(logs)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca estatísticas de e-mails
     */
    async getStats({ response }) {
        try {
            const stats = await this.service.getEmailStats()
            return response.status(200).json(stats)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca e-mails com falha
     */
    async getFailedEmails({ request, response }) {
        try {
            const limit = parseInt(request.input('limit', 100))
            const failedEmails = await this.service.getFailedEmails(limit)
            return response.status(200).json(failedEmails)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca e-mails pendentes
     */
    async getPendingEmails({ request, response }) {
        try {
            const limit = parseInt(request.input('limit', 100))
            const pendingEmails = await this.service.getPendingEmails(limit)
            return response.status(200).json(pendingEmails)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca detalhes de um log específico
     */
    async show({ params, response }) {
        try {
            // Implementar busca por ID específico se necessário
            return response.status(200).json({ message: 'Funcionalidade em desenvolvimento' })
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = EmailLogController 