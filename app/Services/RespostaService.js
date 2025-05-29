'use strict'

const RespostaRepository = require('../Repositories/RespostaRepository')
const PerguntaRepository = require('../Repositories/PerguntaRepository')

class RespostaService {
    constructor() {
        this.repository = new RespostaRepository()
        this.perguntaRepository = new PerguntaRepository()
    }

    async getAllRespostas() {
        try {
            return await this.repository.getAllRespostas()
        } catch (error) {
            throw new Error(`Erro ao buscar respostas: ${error.message}`)
        }
    }

    async getRespostaById(id) {
        if (!id) {
            throw new Error('ID da resposta é obrigatório')
        }

        try {
            const resposta = await this.repository.getRespostaById(id)
            if (!resposta) {
                throw new Error('Resposta não encontrada')
            }
            return resposta
        } catch (error) {
            throw new Error(`Erro ao buscar resposta: ${error.message}`)
        }
    }

    async getRespostasByPerguntaId(perguntaId) {
        if (!perguntaId) {
            throw new Error('ID da pergunta é obrigatório')
        }

        try {
            const pergunta = await this.perguntaRepository.getPerguntaById(perguntaId)
            if (!pergunta) {
                throw new Error('Pergunta não encontrada')
            }

            return await this.repository.getRespostasByPerguntaId(perguntaId)
        } catch (error) {
            throw new Error(`Erro ao buscar respostas da pergunta: ${error.message}`)
        }
    }

    async createResposta(respostaData) {
        const { descricao, id_pergunta } = respostaData

        if (!descricao || !id_pergunta) {
            throw new Error('Todos os campos são obrigatórios')
        }

        if (descricao.length < 3) {
            throw new Error('A descrição deve ter pelo menos 3 caracteres')
        }

        try {
            const pergunta = await this.perguntaRepository.getPerguntaById(id_pergunta)
            if (!pergunta) {
                throw new Error('Pergunta não encontrada')
            }

            return await this.repository.createResposta({
                descricao,
                id_pergunta,
                status: true
            })
        } catch (error) {
            throw new Error(`Erro ao criar resposta: ${error.message}`)
        }
    }

    async updateResposta(id, respostaData) {
        if (!id) {
            throw new Error('ID da resposta é obrigatório')
        }

        const { descricao, id_pergunta, status } = respostaData

        if (!descricao && !id_pergunta && status === undefined) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        if (descricao && descricao.length < 3) {
            throw new Error('A descrição deve ter pelo menos 3 caracteres')
        }

        try {
            const resposta = await this.repository.getRespostaById(id)
            if (!resposta) {
                throw new Error('Resposta não encontrada')
            }

            if (id_pergunta) {
                const pergunta = await this.perguntaRepository.getPerguntaById(id_pergunta)
                if (!pergunta) {
                    throw new Error('Pergunta não encontrada')
                }
            }

            return await this.repository.updateResposta(id, respostaData)
        } catch (error) {
            throw new Error(`Erro ao atualizar resposta: ${error.message}`)
        }
    }

    async inactivateResposta(id) {
        if (!id) {
            throw new Error('ID da resposta é obrigatório')
        }

        try {
            const resposta = await this.repository.getRespostaById(id)
            if (!resposta) {
                throw new Error('Resposta não encontrada')
            }

            return await this.repository.inactivateResposta(id)
        } catch (error) {
            throw new Error(`Erro ao inativar resposta: ${error.message}`)
        }
    }
}

module.exports = RespostaService 