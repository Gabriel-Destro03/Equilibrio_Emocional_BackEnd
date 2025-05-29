'use strict'

const AvaliacaoEmocionalRepository = require('../Repositories/AvaliacaoEmocionalRepository')
const AtividadeEmocionalRepository = require('../Repositories/AtividadeEmocionalRepository')
const N8nClient = require('./n8n/N8nClient')

class AvaliacaoEmocionalService {
    constructor() {
        this.repository = new AvaliacaoEmocionalRepository()
        this.atividadeRepository = new AtividadeEmocionalRepository()
        this.n8nClient = new N8nClient()
    }

    async processarAvaliacao(jornadaData) {
        try {
            // Prepara os dados para o N8n
            const analiseInput = {
                uid: jornadaData.uid,
                emotion: jornadaData.emocao,
                reflexao: jornadaData.reflexao,
                id_jornada: jornadaData.id,
                id_departamento: jornadaData.departamento_id,
                answers: this.formatarRespostas(jornadaData.respostas)
            }

            // Primeiro, envia para análise no N8n e aguarda o retorno
            const resultadoAnalise = await this.n8nClient.sendAnaliseFeedback(analiseInput)

            // Com o retorno do N8n, salva a avaliação emocional
            const avaliacaoData = {
                fator: resultadoAnalise.factor,
                avaliar: resultadoAnalise.evaluate,
                analiseAI: resultadoAnalise.analysisAI,
                uid: jornadaData.uid,
                id_jornada: jornadaData.id,
                departamento_id: jornadaData.departamento_id
            }

            const avaliacao = await this.repository.create(avaliacaoData)

            // Salva as atividades emocionais retornadas pelo N8n
            if (resultadoAnalise.activities && resultadoAnalise.activities.length > 0) {
                const atividadesData = resultadoAnalise.activities.map(atividade => ({
                    id_analise: avaliacao.id,
                    titulo: atividade.title || '',
                    descricao: atividade.description || '',
                    justificativa: atividade.justification || '',
                    como_fazer: atividade.how_to || ''
                }))

                await this.atividadeRepository.createMany(atividadesData)
            }

            return {
                avaliacao,
                atividades: await this.atividadeRepository.getByAvaliacaoId(avaliacao.id)
            }
        } catch (error) {
            throw new Error(`Erro ao processar avaliação: ${error.message}`)
        }
    }

    formatarRespostas(respostas) {
        const formattedAnswers = {}
        respostas.forEach((resposta, index) => {
            formattedAnswers[index] = {
                question: resposta.pergunta || 'Pergunta não encontrada',
                answer: resposta.resposta || 'Resposta não encontrada'
            }
        })
        return formattedAnswers
    }
}

module.exports = AvaliacaoEmocionalService 