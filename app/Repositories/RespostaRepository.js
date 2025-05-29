'use strict'

const Config = use('Config')

class RespostaRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllRespostas() {
        const { data, error } = await this.supabase
            .from('respostas')
            .select('*')
            .eq('status', true)

        if (error) throw new Error(error.message)
        return data
    }

    async getRespostaById(id) {
        const { data, error } = await this.supabase
            .from('respostas')
            .select('*')
            .eq('id', id)
            .eq('status', true)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getRespostasByPerguntaId(perguntaId) {
        const { data, error } = await this.supabase
            .from('respostas')
            .select('*')
            .eq('id_pergunta', perguntaId)
            .eq('status', true)

        if (error) throw new Error(error.message)
        return data
    }

    async createResposta(respostaData) {
        const { data, error } = await this.supabase
            .from('respostas')
            .insert([{ ...respostaData, status: true }])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async updateResposta(id, respostaData) {
        const { data, error } = await this.supabase
            .from('respostas')
            .update(respostaData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async inactivateResposta(id) {
        const { data, error } = await this.supabase
            .from('respostas')
            .update({ status: false })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = RespostaRepository 