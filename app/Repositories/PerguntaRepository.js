'use strict'

const Config = use('Config')

class PerguntaRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllPerguntas() {
        const { data, error } = await this.supabase
            .from('perguntas_duplicate')
            .select('*, respostas_duplicate(*)')
            .eq('status', true)

        if (error) throw new Error(error.message)
        return data
    }

    async getPerguntaById(id) {
        const { data, error } = await this.supabase
            .from('perguntas_duplicate')
            .select('*, respostas_duplicate(*)')
            .eq('id', id)
            .eq('status', true)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async createPergunta(perguntaData) {
        const { data, error } = await this.supabase
            .from('perguntas_duplicate')
            .insert([{ ...perguntaData, status: true }])
            .select('*, respostas_duplicate(*)')
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async updatePergunta(id, perguntaData) {
        const { data, error } = await this.supabase
            .from('perguntas_duplicate')
            .update(perguntaData)
            .eq('id', id)
            .select('*, respostas_duplicate(*)')
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async inactivatePergunta(id) {
        const { data, error } = await this.supabase
            .from('perguntas_duplicate')
            .update({ status: false })
            .eq('id', id)
            .select('*, respostas_duplicate(*)')
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = PerguntaRepository 