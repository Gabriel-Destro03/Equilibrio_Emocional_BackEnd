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
            const parsedAnswer = JSON.parse(data.answerAI)
            return parsedAnswer.answerAI
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
            const body = JSON.stringify({
                userId: analiseInput.uid,
                date: new Date(),
                'emotion-check': 'Como você está se sentindo?',
                'emotion-check-answer': analiseInput.emotion,
                'user-reflections': 'Faça um resumo de suas reflexões',
                'user-reflectionsAnswer': analiseInput.reflexao,
                answers: analiseInput.answers
            })

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
        const response = await fetch(this.n8nUrlAnaliseGeral, {
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
}

module.exports = N8nClient
