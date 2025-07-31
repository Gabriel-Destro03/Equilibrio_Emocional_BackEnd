'use strict'

const Config = use('Config')

class EmailLogRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    /**
     * Cria um novo log de e-mail
     * @param {Object} emailData - Dados do e-mail
     * @returns {Promise<Object>} Log criado
     */
    async createEmailLog(emailData) {
        try {
            const { data, error } = await this.supabase
                .from('email_logs')
                .insert([{
                    to_email: emailData.to_email,
                    subject: emailData.subject,
                    html_content: emailData.html_content,
                    status: emailData.status || 'pending',
                    email_type: emailData.email_type,
                    user_id: emailData.user_id,
                    error_message: emailData.error_message,
                    response_data: emailData.response_data,
                    sent_at: emailData.sent_at
                }])
                .select()
                .single()

            if (error) {
                console.error('Erro ao criar log de e-mail:', error)
                throw new Error(`Erro ao criar log de e-mail: ${error.message}`)
            }

            return data
        } catch (error) {
            console.error('Erro no createEmailLog:', error)
            throw new Error(`Erro ao criar log de e-mail: ${error.message}`)
        }
    }

    /**
     * Atualiza o status de um log de e-mail
     * @param {number} id - ID do log
     * @param {Object} updateData - Dados para atualizar
     * @returns {Promise<Object>} Log atualizado
     */
    async updateEmailLog(id, updateData) {
        try {
            const { data, error } = await this.supabase
                .from('email_logs')
                .update({
                    status: updateData.status,
                    error_message: updateData.error_message,
                    response_data: updateData.response_data,
                    sent_at: updateData.sent_at || new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single()

            if (error) {
                console.error('Erro ao atualizar log de e-mail:', error)
                throw new Error(`Erro ao atualizar log de e-mail: ${error.message}`)
            }

            return data
        } catch (error) {
            console.error('Erro no updateEmailLog:', error)
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
            const { data, error } = await this.supabase
                .from('email_logs')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Erro ao buscar logs de e-mail:', error)
                throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
            }

            return data || []
        } catch (error) {
            console.error('Erro no getEmailLogsByStatus:', error)
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
            const { data, error } = await this.supabase
                .from('email_logs')
                .select('*')
                .eq('email_type', emailType)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Erro ao buscar logs de e-mail:', error)
                throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
            }

            return data || []
        } catch (error) {
            console.error('Erro no getEmailLogsByType:', error)
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
            const { data, error } = await this.supabase
                .from('email_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Erro ao buscar logs de e-mail:', error)
                throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
            }

            return data || []
        } catch (error) {
            console.error('Erro no getEmailLogsByUser:', error)
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
            const offset = (page - 1) * limit

            const { data, error, count } = await this.supabase
                .from('email_logs')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) {
                console.error('Erro ao buscar logs de e-mail:', error)
                throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
            }

            return {
                data: data || [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            }
        } catch (error) {
            console.error('Erro no getAllEmailLogs:', error)
            throw new Error(`Erro ao buscar logs de e-mail: ${error.message}`)
        }
    }

    /**
     * Busca estatísticas de e-mails
     * @returns {Promise<Object>} Estatísticas
     */
    async getEmailStats() {
        try {
            // Total de e-mails
            const { count: total, error: totalError } = await this.supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true })

            if (totalError) {
                throw new Error(`Erro ao buscar total de e-mails: ${totalError.message}`)
            }

            // E-mails enviados com sucesso
            const { count: sent, error: sentError } = await this.supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'sent')

            if (sentError) {
                throw new Error(`Erro ao buscar e-mails enviados: ${sentError.message}`)
            }

            // E-mails com falha
            const { count: failed, error: failedError } = await this.supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'failed')

            if (failedError) {
                throw new Error(`Erro ao buscar e-mails com falha: ${failedError.message}`)
            }

            // E-mails pendentes
            const { count: pending, error: pendingError } = await this.supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')

            if (pendingError) {
                throw new Error(`Erro ao buscar e-mails pendentes: ${pendingError.message}`)
            }

            return {
                total: total || 0,
                sent: sent || 0,
                failed: failed || 0,
                pending: pending || 0,
                successRate: total > 0 ? ((sent || 0) / total * 100).toFixed(2) : 0
            }
        } catch (error) {
            console.error('Erro no getEmailStats:', error)
            throw new Error(`Erro ao buscar estatísticas de e-mail: ${error.message}`)
        }
    }
}

module.exports = EmailLogRepository 