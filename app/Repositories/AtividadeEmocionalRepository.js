'use strict'

const Config = use('Config')

class AtividadeEmocionalRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async create(atividadeData) {
        const { data, error } = await this.supabase
            .from('atividades_emocionais')
            .insert([atividadeData])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async createMany(atividadesData) {
        const { data, error } = await this.supabase
            .from('atividades_emocionais')
            .insert(atividadesData)
            .select()

        if (error) throw new Error(error.message)
        return data
    }

    async getByAvaliacaoId(avaliacaoId) {
        const { data, error } = await this.supabase
            .from('atividades_emocionais')
            .select('*')
            .eq('id_analise', avaliacaoId)

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = AtividadeEmocionalRepository 