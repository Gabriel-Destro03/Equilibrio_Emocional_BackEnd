'use strict'

const Config = use('Config')

class AvaliacaoEmocionalRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async create(avaliacaoData) {
        const { data, error } = await this.supabase
            .from('avaliacoes_emocionais')
            .insert([avaliacaoData])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getById(id) {
        const { data, error } = await this.supabase
            .from('avaliacoes_emocionais')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = AvaliacaoEmocionalRepository 