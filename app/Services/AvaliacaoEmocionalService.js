'use strict'

const AvaliacaoEmocionalRepository = require('../Repositories/AvaliacaoEmocionalRepository')
const AtividadeEmocionalRepository = require('../Repositories/AtividadeEmocionalRepository')
const N8nClient = require('./n8n/N8nClient')
const PerguntaRepository = require('../Repositories/PerguntaRepository')
const RespostaRepository = require('../Repositories/RespostaRepository')

class AvaliacaoEmocionalService {
    constructor() {
        this.repository = new AvaliacaoEmocionalRepository()
        this.atividadeRepository = new AtividadeEmocionalRepository()
        this.n8nClient = new N8nClient()
        this.perguntaRepository = new PerguntaRepository()
        this.respostaRepository = new RespostaRepository()
    }

    async processarAvaliacao(jornadaData) {
        try {
            // Debug: Log do formato das respostas antes de formatar
            console.log('=== DEBUG: jornadaData.respostas ===')
            console.log('Tipo:', typeof jornadaData.respostas)
            console.log('É Array?', Array.isArray(jornadaData.respostas))
            console.log('Conteúdo:', JSON.stringify(jornadaData.respostas, null, 2))
            
            // Formata as respostas
            const formattedAnswers = await this.formatarRespostas(jornadaData.respostas)
            
            // Debug: Log do formato das respostas após formatar
            console.log('=== DEBUG: answers formatadas ===')
            console.log('Conteúdo:', JSON.stringify(formattedAnswers, null, 2))
            
            // Prepara os dados para o N8n
            const analiseInput = {
                uid: jornadaData.uid,
                emotion: jornadaData.emocao,
                reflexao: jornadaData.reflexao,
                id_jornada: jornadaData.id,
                id_departamento: jornadaData.departamento_id,
                answers: formattedAnswers
            }
            
            // Debug: Log completo do que será enviado ao N8n
            console.log('=== DEBUG: Payload completo para N8n ===')
            console.log(JSON.stringify(analiseInput, null, 2))

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

    async formatarRespostas(respostas) {
        try {
            // Busca todas as perguntas e respostas de uma vez das tabelas duplicadas
            const [todasPerguntas, todasRespostas] = await Promise.all([
                this.perguntaRepository.getAllPerguntas(),
                this.respostaRepository.getAllRespostas()
            ])

            // Cria mapas para acesso rápido
            const mapaPerguntas = todasPerguntas.reduce((map, pergunta) => {
                map[pergunta.id] = pergunta
                return map
            }, {})

            const mapaRespostas = todasRespostas.reduce((map, resposta) => {
                map[resposta.id] = resposta
                return map
            }, {})

            // Formata as respostas usando os mapas
            const formattedAnswers = {}
            respostas.forEach((resposta, index) => {
                // Verifica se já tem texto completo ou precisa buscar pelo ID
                if (resposta.pergunta && resposta.resposta) {
                    // Já tem texto completo
                    formattedAnswers[index] = {
                        question: resposta.pergunta,
                        answer: resposta.resposta
                    }
                } else if (resposta.id_perguntas && resposta.id_resposta) {
                    // Precisa buscar pelo ID
                    const pergunta = mapaPerguntas[resposta.id_perguntas]
                    const respostaObj = mapaRespostas[resposta.id_resposta]
                    
                    formattedAnswers[index] = {
                        question: pergunta?.descricao || 'Pergunta não encontrada',
                        answer: respostaObj?.descricao || 'Resposta não encontrada'
                    }
                } else {
                    formattedAnswers[index] = {
                        question: 'Pergunta não encontrada',
                        answer: 'Resposta não encontrada'
                    }
                }
            })
            
            return formattedAnswers
        } catch (error) {
            console.error('Erro ao formatar respostas:', error)
            throw new Error(`Erro ao formatar respostas: ${error.message}`)
        }
    }
}

module.exports = AvaliacaoEmocionalService 