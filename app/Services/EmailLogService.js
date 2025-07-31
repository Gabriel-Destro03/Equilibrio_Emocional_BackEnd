'use strict'

const EmailLogRepository = use('App/Repositories/EmailLogRepository')

class EmailLogService {
    constructor() {
        this.repository = new EmailLogRepository()
    }

    /**
     * Cria um log de e-mail antes do envio
     * @param {Object} emailData - Dados do e-mail
     * @returns {Promise<Object>} Log criado
     */
    async createEmailLog(emailData) {
        try {
            return await this.repository.createEmailLog({
                to_email: emailData.to,
                subject: emailData.subject,
                html_content: emailData.html,
                status: 'pending',
                email_type: emailData.emailType,
                user_id: emailData.userId
            })
        } catch (error) {
            console.error('Erro ao criar log de e-mail:', error)
            throw new Error(`Erro ao criar log de e-mail: ${error.message}`)
        }
    }

    /**
     * Atualiza o log de e-mail após o envio
     * @param {number} logId - ID do log
     * @param {Object} result - Resultado do envio
     * @returns {Promise<Object>} Log atualizado
     */
    async updateEmailLogAfterSend(logId, result) {
        try {
            const updateData = {
                status: result.success ? 'sent' : 'failed',
                sent_at: result.success ? new Date().toISOString() : null,
                response_data: result.data || result.error,
                error_message: result.success ? null : result.error
            }

            return await this.repository.updateEmailLog(logId, updateData)
        } catch (error) {
            console.error('Erro ao atualizar log de e-mail:', error)
            throw new Error(`Erro ao atualizar log de e-mail: ${error.message}`)
        }
    }

    /**
     * Busca logs de e-mail por status
     * @param {string} status - Status dos e-mails
     * @returns {Promise<Array>} Lista de logs
     */
    async getEmailLogsByStatus(status) {
        try {
            return await this.repository.getEmailLogsByStatus(status)
        } catch (error) {
            console.error('Erro ao buscar logs de e-mail por status:', error)
            throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
        }
    }

    /**
     * Busca logs de e-mail por tipo
     * @param {string} emailType - Tipo do e-mail
     * @returns {Promise<Array>} Lista de logs
     */
    async getEmailLogsByType(emailType) {
        try {
            return await this.repository.getEmailLogsByType(emailType)
        } catch (error) {
            console.error('Erro ao buscar logs de e-mail por tipo:', error)
            throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
        }
    }

    /**
     * Busca logs de e-mail por usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Array>} Lista de logs
     */
    async getEmailLogsByUser(userId) {
        try {
            return await this.repository.getEmailLogsByUser(userId)
        } catch (error) {
            console.error('Erro ao buscar logs de e-mail por usuário:', error)
            throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
        }
    }

    /**
     * Busca todos os logs de e-mail com paginação
     * @param {number} page - Página atual
     * @param {number} limit - Limite por página
     * @returns {Promise<Object>} Lista paginada de logs
     */
    async getAllEmailLogs(page = 1, limit = 50) {
        try {
            return await this.repository.getAllEmailLogs(page, limit)
        } catch (error) {
            console.error('Erro ao buscar todos os logs de e-mail:', error)
            throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
        }
    }

    /**
     * Busca estatísticas de e-mails
     * @returns {Promise<Object>} Estatísticas
     */
    async getEmailStats() {
        try {
            return await this.repository.getEmailStats()
        } catch (error) {
            console.error('Erro ao buscar estatísticas de e-mail:', error)
            throw new Error(`Erro ao buscar estatísticas de e-mail: ${error.message}`)
        }
    }

    /**
     * Busca e-mails com falha para análise
     * @param {number} limit - Limite de registros
     * @returns {Promise<Array>} Lista de e-mails com falha
     */
    async getFailedEmails(limit = 100) {
        try {
            const failedEmails = await this.repository.getEmailLogsByStatus('failed')
            return failedEmails.slice(0, limit)
        } catch (error) {
            console.error('Erro ao buscar e-mails com falha:', error)
            throw new Error(`Erro ao buscar e-mails com falha: ${error.message}`)
        }
    }

    /**
     * Busca e-mails pendentes
     * @param {number} limit - Limite de registros
     * @returns {Promise<Array>} Lista de e-mails pendentes
     */
    async getPendingEmails(limit = 100) {
        try {
            const pendingEmails = await this.repository.getEmailLogsByStatus('pending')
            return pendingEmails.slice(0, limit)
        } catch (error) {
            console.error('Erro ao buscar e-mails pendentes:', error)
            throw new Error(`Erro ao buscar e-mails pendentes: ${error.message}`)
        }
    }
}

module.exports = EmailLogService 