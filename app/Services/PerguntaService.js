'use strict'

const PerguntaRepository = require('../Repositories/PerguntaRepository')

class PerguntaService {
    constructor() {
        this.repository = new PerguntaRepository()
    }

    async getAllPerguntas() {
        try {
            return await this.repository.getAllPerguntas()
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
            return pergunta
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
            return await this.repository.createPergunta({
                descricao,
                categoria,
                status: true
            })
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

            return await this.repository.updatePergunta(id, perguntaData)
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

            return await this.repository.inactivatePergunta(id)
        } catch (error) {
            throw new Error(`Erro ao inativar pergunta: ${error.message}`)
        }
    }
}

module.exports = PerguntaService 