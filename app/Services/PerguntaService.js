'use strict'

const PerguntaRepository = require('../Repositories/PerguntaRepository')
const RespostaRepository = require('../Repositories/RespostaRepository')

class PerguntaService {
    constructor() {
        this.repository = new PerguntaRepository()
        this.respostaRepository = new RespostaRepository()
    }

    formatResposta(resposta) {
        return {
            id: resposta.id,
            descricao: resposta.descricao
        }
    }

    async getAllPerguntas() {
        try {
            const perguntas = await this.repository.getAllPerguntas()
            const perguntasComRespostas = await Promise.all(
                perguntas.map(async (pergunta) => {
                    const respostas = await this.respostaRepository.getRespostasByPerguntaId(pergunta.id)
                    return {
                        ...pergunta,
                        respostas: respostas.map(this.formatResposta)
                    }
                })
            )
            return perguntasComRespostas
        } catch (error) {
            throw new Error(`Erro ao buscar perguntas: ${error.message}`)
        }
    }

    async getPerguntaById(id) {
        if (!id) {
            throw new Error('ID da pergunta é obrigatório')
        }

        try {
            const pergunta = await this.repository.getPerguntaById(id)
            if (!pergunta) {
                throw new Error('Pergunta não encontrada')
            }
            const respostas = await this.respostaRepository.getRespostasByPerguntaId(id)
            return {
                ...pergunta,
                respostas: respostas.map(this.formatResposta)
            }
        } catch (error) {
            throw new Error(`Erro ao buscar pergunta: ${error.message}`)
        }
    }

    async createPergunta(perguntaData) {
        const { descricao, categoria } = perguntaData

        if (!descricao || !categoria) {
            throw new Error('Todos os campos são obrigatórios')
        }

        if (descricao.length < 3) {
            throw new Error('A descrição deve ter pelo menos 3 caracteres')
        }

        try {
            const pergunta = await this.repository.createPergunta({
                descricao,
                categoria,
                status: true
            })
            return {
                ...pergunta,
                respostas: []
            }
        } catch (error) {
            throw new Error(`Erro ao criar pergunta: ${error.message}`)
        }
    }

    async updatePergunta(id, perguntaData) {
        if (!id) {
            throw new Error('ID da pergunta é obrigatório')
        }

        const { descricao, categoria, status } = perguntaData

        if (!descricao && !categoria && status === undefined) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        if (descricao && descricao.length < 3) {
            throw new Error('A descrição deve ter pelo menos 3 caracteres')
        }

        try {
            const pergunta = await this.repository.getPerguntaById(id)
            if (!pergunta) {
                throw new Error('Pergunta não encontrada')
            }

            const perguntaAtualizada = await this.repository.updatePergunta(id, perguntaData)
            const respostas = await this.respostaRepository.getRespostasByPerguntaId(id)
            return {
                ...perguntaAtualizada,
                respostas: respostas.map(this.formatResposta)
            }
        } catch (error) {
            throw new Error(`Erro ao atualizar pergunta: ${error.message}`)
        }
    }

    async inactivatePergunta(id) {
        if (!id) {
            throw new Error('ID da pergunta é obrigatório')
        }

        try {
            const pergunta = await this.repository.getPerguntaById(id)
            if (!pergunta) {
                throw new Error('Pergunta não encontrada')
            }

            const perguntaInativada = await this.repository.inactivatePergunta(id)
            const respostas = await this.respostaRepository.getRespostasByPerguntaId(id)
            return {
                ...perguntaInativada,
                respostas: respostas.map(this.formatResposta)
            }
        } catch (error) {
            throw new Error(`Erro ao inativar pergunta: ${error.message}`)
        }
    }
}

module.exports = PerguntaService 