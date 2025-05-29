'use strict'

const JornadaRepository = require('../Repositories/JornadaRepository')
const AvaliacaoEmocionalService = require('./AvaliacaoEmocionalService')
const N8nClient = require('./n8n/N8nClient')
const PerguntaRepository = require('../Repositories/PerguntaRepository')
const RespostaRepository = require('../Repositories/RespostaRepository')

class JornadaService {
    constructor() {
        this.repository = new JornadaRepository()
        this.avaliacaoService = new AvaliacaoEmocionalService()
        this.n8nClient = new N8nClient()
        this.perguntaRepository = new PerguntaRepository()
        this.respostaRepository = new RespostaRepository()
    }

    async getAllJornadas() {
        try {
            return await this.repository.getAllJornadas()
        } catch (error) {
            console.error('Erro ao buscar jornadas:', error)
            throw new Error(`Erro ao buscar jornadas: ${error.message}`)
        }
    }

    async getJornadaById(id) {
        if (!id) {
            throw new Error('ID da jornada é obrigatório')
        }

        try {
            const jornada = await this.repository.getJornadaById(id)
            if (!jornada) {
                throw new Error('Jornada não encontrada')
            }
            return jornada
        } catch (error) {
            console.error('Erro ao buscar jornada:', error)
            throw new Error(`Erro ao buscar jornada: ${error.message}`)
        }
    }

    async formatarRespostasParaAnalise(jornadaRespostas) {
        // Busca todas as perguntas e respostas de uma vez
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
        return jornadaRespostas.map(jr => {
            const pergunta = mapaPerguntas[jr.id_perguntas]
            const resposta = mapaRespostas[jr.id_resposta]
            
            return {
                question: pergunta?.descricao || 'Pergunta não encontrada',
                answer: resposta?.descricao || 'Resposta não encontrada'
            }
        })
    }

    async createJornada(jornadaData) {
        try {
            // Validação dos dados da jornada
            if (!jornadaData.emocao) {
                throw new Error('Campo emocao é obrigatório')
            }
            if (!jornadaData.uid) {
                throw new Error('Campo uid é obrigatório')
            }

            // Cria a jornada
            const jornada = await this.repository.createJornada(jornadaData)

            // Se houver respostas, cria as respostas da jornada
            if (jornadaData.respostas && Array.isArray(jornadaData.respostas) && jornadaData.respostas.length > 0) {
                // Prepara os dados das respostas
                const respostasParaCriar = jornadaData.respostas.map(resposta => {
                    if (!resposta.id_pergunta) {
                        throw new Error(`Resposta inválida: id_pergunta é obrigatório`)
                    }
                    if (!resposta.id_resposta) {
                        throw new Error(`Resposta inválida: id_resposta é obrigatório`)
                    }

                    return {
                        id_jornada: jornada.id,
                        id_perguntas: resposta.id_pergunta,
                        id_resposta: resposta.id_resposta
                    }
                })
                // Cria as respostas
                const respostas = await this.repository.createJornadaRespostas(respostasParaCriar)

                // Adiciona as respostas ao objeto da jornada
                //jornada.respostas = respostas
            }

            // Envia para análise de feedback
            return jornada
        } catch (error) {
            console.error('Erro ao criar jornada:', error)
            throw error
        }
    }

    async updateJornada(id, jornadaData) {
        if (!id) {
            throw new Error('ID da jornada é obrigatório')
        }

        const { emocao, reflexao, respostas } = jornadaData

        if (!emocao && !reflexao && !respostas) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        try {
            const jornada = await this.repository.getJornadaById(id)
            if (!jornada) {
                throw new Error('Jornada não encontrada')
            }

            // Se houver novas respostas, atualiza-as
            if (respostas && Array.isArray(respostas) && respostas.length > 0) {
                const respostasFormatadas = respostas.map(resposta => ({
                    id_jornada: id,
                    id_perguntas: resposta.id_pergunta,
                    id_resposta: resposta.id_resposta
                }))

                await this.repository.createJornadaRespostas(respostasFormatadas)
            }

            // Atualiza os dados básicos da jornada
            return await this.repository.updateJornada(id, {
                emocao,
                reflexao
            })
        } catch (error) {
            console.error('Erro ao atualizar jornada:', error)
            throw new Error(`Erro ao atualizar jornada: ${error.message}`)
        }
    }
}

module.exports = JornadaService 