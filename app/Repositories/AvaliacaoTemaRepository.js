'use strict'

const Config = use('Config')

class AvaliacaoTemaRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    /**
     * Busca avaliações de temas por departamentoId
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Array>} Lista de avaliações de temas
     */
    async getByDepartamentoId(departamentoId) {
        const { data, error } = await this.supabase
            .from('avaliacoes_temas')
            .select('*')
            .eq('departamento_id', departamentoId)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Busca avaliações de temas por departamentoId com filtro de data (mais de 5 dias)
     * @param {number} departamentoId - ID do departamento
     * @returns {Promise<Array>} Lista de avaliações de temas com mais de 5 dias
     */
    async getByDepartamentoIdWithDateFilter(departamentoId) {
        const fiveDaysAgo = new Date()
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

        const { data, error } = await this.supabase
            .from('avaliacoes_temas')
            .select('*')
            .eq('departamento_id', departamentoId)
            .gte('created_at', fiveDaysAgo.toISOString())
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Busca todas as avaliações de temas
     * @returns {Promise<Array>} Lista de todas as avaliações de temas
     */
    async getAll() {
        const { data, error } = await this.supabase
            .from('avaliacoes_temas')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Busca uma avaliação de tema por ID
     * @param {number} id - ID da avaliação
     * @returns {Promise<Object>} Avaliação de tema
     */
    async getById(id) {
        const { data, error } = await this.supabase
            .from('avaliacoes_temas')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Cria uma nova avaliação de tema
     * @param {Object} avaliacaoData - Dados da avaliação
     * @returns {Promise<Object>} Avaliação criada
     */
    async create(avaliacaoData) {
        const { data, error } = await this.supabase
            .from('avaliacoes_temas')
            .insert([avaliacaoData])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Atualiza uma avaliação de tema
     * @param {number} id - ID da avaliação
     * @param {Object} avaliacaoData - Dados para atualização
     * @returns {Promise<Object>} Avaliação atualizada
     */
    async update(id, avaliacaoData) {
        const { data, error } = await this.supabase
            .from('avaliacoes_temas')
            .update(avaliacaoData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Remove uma avaliação de tema
     * @param {number} id - ID da avaliação
     * @returns {Promise<void>}
     */
    async delete(id) {
        const { error } = await this.supabase
            .from('avaliacoes_temas')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
    }
}

module.exports = AvaliacaoTemaRepository