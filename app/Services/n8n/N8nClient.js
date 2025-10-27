'use strict'

const Config = use('Config')
const Env = use('Env')

class N8nClient {
    constructor() {
        this.n8nUrl = Env.get('VITE_API_URL')
        this.n8nUrlIA = Env.get('VITE_API_ANALISE_IA')
        this.n8nUrlAnaliseGeral = Env.get('VITE_API_ATUALAR_ANALISE_GERAL')
    }

    /**
     * Envia uma mensagem para a Clara IA
     * @param {string} message - A mensagem a ser enviada
     * @param {string} uid - ID do usuário
     * @returns {Promise<string>} Resposta da Clara IA
     */
    async sendMessageToClara(message, uid) {
        const body = {
            message,
            userId: uid
        }

        try {
            const response = await fetch(this.n8nUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                throw new Error('Erro ao enviar mensagem')
            }

            const data = await response.json()
            const parsedAnswer = data.answerAI
            return parsedAnswer
        } catch (error) {
            console.error('Erro na comunicação com a Clara IA:', error)
            throw error
        }
    }

    /**
     * Envia análise de feedback para processamento
     * @param {Object} analiseInput - Dados da análise
     * @returns {Promise<Object>} Resultado da análise
     */
    async sendAnaliseFeedback(analiseInput) {
        try {
            const bodyData = {
                userId: analiseInput.uid,
                date: new Date(),
                'emotion-check': 'Como você está se sentindo?',
                'emotion-check-answer': analiseInput.emotion,
                'user-reflections': 'Faça um resumo de suas reflexões',
                'user-reflectionsAnswer': analiseInput.reflexao,
                answers: analiseInput.answers
            }
            
            // Debug: Log do que está sendo enviado ao N8n
            console.log('=== DEBUG: Body sendo enviado ao N8n ===')
            console.log(JSON.stringify(bodyData, null, 2))
            
            const body = JSON.stringify(bodyData)
            
            const response = await fetch(this.n8nUrlIA, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body
            })
            
            if (!response.ok) {
                console.error('Erro na resposta da API:', response.status, response.statusText)
                throw new Error('Erro ao enviar mensagem')
            }

            const rawData = await response.json()

            // Formata os dados conforme esperado pelo contexto
            return {
                analysisAI: rawData.analysisAI || rawData.analysis || '',
                factor: rawData.factor || '',
                evaluate: rawData.evaluate || '',
                id_jornada: analiseInput.id_jornada,
                activities: rawData.activities || rawData.recommendations || [],
                departamento_id: analiseInput.id_departamento
            }
        } catch (error) {
            console.error('Erro na comunicação com o Agente de IA:', error)
            throw error
        }
    }

    /**
     * Atualiza avaliações por departamento
     * @param {string} departamentoId - ID do departamento
     * @returns {Promise<Object>} Resultado da atualização
     */
    async atualizarAvaliacoesPorDepartamento(departamentoId) {
        const response = await fetch('https://n8n.3xsolutions.com.br/webhook/dedc21d1-5b07-4176-8d06-7efea5f2e22b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                departamento_id: departamentoId
            })
        })

        if (!response.ok) {
            throw new Error('Erro ao atualizar avaliações por departamento')
        }

        return response.json()
    }

    /**
     * Atualiza avaliações de temas por departamento quando têm mais de 5 dias
     * @param {number} departamentoId - ID do departamento
     * @param {Array} avaliacoes - Lista de avaliações encontradas
     * @returns {Promise<Object>} Resultado da atualização
     */
    async atualizarAvaliacoesTemasPorDepartamento(departamentoId, avaliacoes = []) {
        try {
            console.log(`Iniciando atualização de avaliações de temas via n8n para departamento ${departamentoId}`)
            console.log(`Encontradas ${avaliacoes.length} avaliações com mais de 5 dias`)

            // Chama a integração n8n existente
            const resultadoN8n = await this.atualizarAvaliacoesPorDepartamento(departamentoId)
            
            console.log(`Atualização via n8n concluída para departamento ${departamentoId}:`, resultadoN8n)

            return resultadoN8n
        } catch (error) {
            console.error(`Erro ao atualizar avaliações de temas via n8n para departamento ${departamentoId}:`, error.message)
            
            // Retorna erro estruturado mas não quebra o fluxo
            return {
                departamento_id: departamentoId,
                status: 'erro',
                total_avaliacoes: avaliacoes ? avaliacoes.length : 0,
                n8n_executado: false,
                data_atualizacao: new Date().toISOString(),
                erro: error.message,
                avaliacoes_processadas: avaliacoes ? avaliacoes.map(a => ({
                    id: a.id,
                    tema: a.tema,
                    created_at: a.created_at
                })) : []
            }
        }
    }

    /**
     * Força atualização de avaliações de temas via n8n independentemente do filtro de data
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Object>} Resultado da atualização
     */
    async forcarAtualizacaoAvaliacoesTemas(departamentoId) {
        try {
            console.log(`Forçando atualização de avaliações de temas via n8n para departamento ${departamentoId}`)
            
            const resultadoN8n = await this.atualizarAvaliacoesPorDepartamento(departamentoId)
            
            console.log(`Atualização forçada via n8n concluída para departamento ${departamentoId}:`, resultadoN8n)
            
            return {
                departamento_id: departamentoId,
                status: 'atualizado_forcado',
                n8n_executado: true,
                data_atualizacao: new Date().toISOString(),
                resultado_n8n: resultadoN8n,
                tipo_operacao: 'forcada'
            }
        } catch (error) {
            console.error(`Erro ao forçar atualização de avaliações de temas via n8n para departamento ${departamentoId}:`, error.message)
            throw error
        }
    }
}

module.exports = N8nClient
