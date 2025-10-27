'use strict'

const AvaliacaoTemaRepository = require('../Repositories/AvaliacaoTemaRepository')
const ValidationHelper = require('../Helpers/ValidationHelper')
const IAvaliacaoTemaService = require('../Interfaces/IAvaliacaoTemaService')

class AvaliacaoTemaService extends IAvaliacaoTemaService {
    constructor() {
        super()
        this.repository = new AvaliacaoTemaRepository()
    }

    // Implementação dos métodos da interface IService
    async getAll() {
        return this.getAllAvaliacoesTemas()
    }

    async getById(id) {
        return this.getAvaliacaoTemaById(id)
    }

    async create(data) {
        return this.createAvaliacaoTema(data)
    }

    async update(id, data) {
        return this.updateAvaliacaoTema(id, data)
    }

    async inactivate(id) {
        return this.deleteAvaliacaoTema(id)
    }

    // =============================
    // 🔹 MÉTODOS DE BUSCA
    // =============================

    /**
     * Busca todas as avaliações de temas
     * @returns {Promise<Array>} Lista de avaliações de temas
     */
    async getAllAvaliacoesTemas() {
        try {
            return await this.repository.getAll()
        } catch (error) {
            throw new Error(`Erro ao buscar avaliações de temas: ${error.message}`)
        }
    }

    /**
     * Busca uma avaliação de tema por ID
     * @param {number} id - ID da avaliação
     * @returns {Promise<Object>} Avaliação de tema
     */
    async getAvaliacaoTemaById(id) {
        ValidationHelper.requireField(id, 'ID da avaliação é obrigatório')
        try {
            const avaliacao = await this.repository.getById(id)
            if (!avaliacao) throw new Error('Avaliação de tema não encontrada')
            return avaliacao
        } catch (error) {
            throw new Error(`Erro ao buscar avaliação de tema: ${error.message}`)
        }
    }

    /**
     * Busca avaliações de temas por departamentoId
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Array>} Lista de avaliações de temas
     */
    async getAvaliacoesTemasByDepartamentoId(departamentoId) {
        ValidationHelper.requireField(departamentoId, 'ID do departamento é obrigatório')
        try {
            return await this.repository.getByDepartamentoId(departamentoId)
        } catch (error) {
            throw new Error(`Erro ao buscar avaliações de temas por departamento: ${error.message}`)
        }
    }

    /**
     * Busca avaliações de temas por departamentoId com filtro de data (mais de 5 dias)
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Array>} Lista de avaliações de temas com mais de 5 dias
     */
    async getAvaliacoesTemasByDepartamentoIdWithDateFilter(departamentoId) {
        ValidationHelper.requireField(departamentoId, 'ID do departamento é obrigatório')
        try {
            return await this.repository.getByDepartamentoIdWithDateFilter(departamentoId)
        } catch (error) {
            throw new Error(`Erro ao buscar avaliações de temas por departamento com filtro de data: ${error.message}`)
        }
    }

    // =============================
    // 🔹 CRUD DE AVALIAÇÕES DE TEMAS
    // =============================

    /**
     * Cria uma nova avaliação de tema
     * @param {Object} avaliacaoData - Dados da avaliação
     * @returns {Promise<Object>} Avaliação criada
     */
    async createAvaliacaoTema(avaliacaoData) {
        await this.validateAvaliacaoTemaData(avaliacaoData, false)
        
        try {
            const avaliacao = await this.repository.create(avaliacaoData)
            if (!avaliacao) throw new Error('Erro ao criar avaliação de tema: Dados não retornados')
            return avaliacao
        } catch (error) {
            throw new Error(`Erro ao criar avaliação de tema: ${error.message}`)
        }
    }

    /**
     * Atualiza uma avaliação de tema existente
     * @param {number} id - ID da avaliação
     * @param {Object} avaliacaoData - Dados para atualização
     * @returns {Promise<Object>} Avaliação atualizada
     */
    async updateAvaliacaoTema(id, avaliacaoData) {
        ValidationHelper.requireField(id, 'ID da avaliação é obrigatório')
        
        // Verifica se pelo menos um campo foi fornecido para atualização
        if (avaliacaoData && Object.keys(avaliacaoData).length === 0) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        try {
            await this.validateAvaliacaoTemaData(avaliacaoData, true)
            
            const avaliacao = await this.repository.getById(id)
            if (!avaliacao) throw new Error('Avaliação de tema não encontrada')

            return await this.repository.update(id, avaliacaoData)
        } catch (error) {
            throw new Error(`Erro ao atualizar avaliação de tema: ${error.message}`)
        }
    }

    /**
     * Remove uma avaliação de tema
     * @param {number} id - ID da avaliação
     * @returns {Promise<void>}
     */
    async deleteAvaliacaoTema(id) {
        ValidationHelper.requireField(id, 'ID da avaliação é obrigatório')
        try {
            const avaliacao = await this.repository.getById(id)
            if (!avaliacao) throw new Error('Avaliação de tema não encontrada')
            
            await this.repository.delete(id)
        } catch (error) {
            throw new Error(`Erro ao remover avaliação de tema: ${error.message}`)
        }
    }

    // =============================
    // 🔹 VALIDAÇÕES
    // =============================

    /**
     * Valida dados da avaliação de tema
     * @param {Object} avaliacaoData - Dados da avaliação
     * @param {boolean} isUpdate - Se é uma atualização
     */
    async validateAvaliacaoTemaData(avaliacaoData, isUpdate = false) {
        // Verifica se avaliacaoData foi fornecido
        if (!avaliacaoData) {
            throw new Error('Dados da avaliação são obrigatórios')
        }

        if (!isUpdate) {
            ValidationHelper.requireField(avaliacaoData.departamento_id, 'ID do departamento é obrigatório')
            ValidationHelper.requireField(avaliacaoData.tema, 'Tema é obrigatório')
            ValidationHelper.requireField(avaliacaoData.avaliacao, 'Avaliação é obrigatória')
        }

        // Validação de campos opcionais apenas se fornecidos
        if (avaliacaoData.departamento_id && typeof avaliacaoData.departamento_id !== 'number') {
            throw new Error('ID do departamento deve ser um número')
        }

        if (avaliacaoData.tema && avaliacaoData.tema.trim() === '') {
            throw new Error('Tema não pode estar vazio')
        }

        if (avaliacaoData.avaliacao && avaliacaoData.avaliacao.trim() === '') {
            throw new Error('Avaliação não pode estar vazia')
        }
    }
}

module.exports = AvaliacaoTemaService
