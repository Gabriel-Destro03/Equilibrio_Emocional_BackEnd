'use strict'

const FilialRepository = require('../Repositories/FilialRepository')

class FilialService {
    constructor() {
        this.repository = new FilialRepository()
    }

    async getAllFiliais() {
        try {
            return await this.repository.getAllFiliais()
        } catch (error) {
            throw new Error(`Erro ao buscar filiais: ${error.message}`)
        }
    }

    async getFilialById(id) {
        if (!id) {
            throw new Error('ID da filial é obrigatório')
        }

        try {
            const filial = await this.repository.getFilialById(id)
            if (!filial) {
                throw new Error('Filial não encontrada')
            }
            return filial
        } catch (error) {
            throw new Error(`Erro ao buscar filial: ${error.message}`)
        }
    }

    async createFilial(filialData) {
        const { nome_filial, cnpj, endereco } = filialData

        if (!nome_filial || !cnpj || !endereco) {
            throw new Error('Todos os campos são obrigatórios')
        }

        if (cnpj.length !== 14) {
            throw new Error('CNPJ inválido')
        }

        try {
            return await this.repository.createFilial({
                nome_filial,
                cnpj,
                endereco
            })
        } catch (error) {
            throw new Error(`Erro ao criar filial: ${error.message}`)
        }
    }

    async updateFilial(id, filialData) {
        if (!id) {
            throw new Error('ID da filial é obrigatório')
        }

        const { nome_filial, cnpj, endereco } = filialData

        if (!nome_filial && !cnpj && !endereco) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        if (cnpj && cnpj.length !== 14) {
            throw new Error('CNPJ inválido')
        }

        try {
            const filial = await this.repository.getFilialById(id)
            if (!filial) {
                throw new Error('Filial não encontrada')
            }

            return await this.repository.updateFilial(id, filialData)
        } catch (error) {
            throw new Error(`Erro ao atualizar filial: ${error.message}`)
        }
    }

    async inactivateFilial(id) {
        if (!id) {
            throw new Error('ID da filial é obrigatório')
        }

        try {
            const filial = await this.repository.getFilialById(id)
            if (!filial) {
                throw new Error('Filial não encontrada')
            }

            return await this.repository.inactivateFilial(id)
        } catch (error) {
            throw new Error(`Erro ao inativar filial: ${error.message}`)
        }
    }

    async changeStatus(id, novoStatus) {
        if (!id) {
            throw new Error('ID da filial é obrigatório')
        }

        try {
            const filial = await this.repository.getFilialById(id)
            if (!filial) {
                throw new Error('Filial não encontrada')
            }

            return await this.repository.updateFilial(id, { status: novoStatus })
        } catch (error) {
            throw new Error(`Erro ao alterar status da filial: ${error.message}`)
        }
    }
}

module.exports = FilialService 