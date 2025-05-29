'use strict'

const Config = use('Config')

class FilialRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllFiliais() {
        const { data, error } = await this.supabase
            .from('filiais')
            .select('*')

        if (error) throw new Error(error.message)
        return data
    }

    async getFilialById(id) {
        const { data, error } = await this.supabase
            .from('filiais')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async createFilial(filialData) {
        const { data, error } = await this.supabase
            .from('filiais')
            .insert([{ ...filialData, status: true }])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async updateFilial(id, filialData) {
        const { data, error } = await this.supabase
            .from('filiais')
            .update(filialData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async inactivateFilial(id) {
        const { data, error } = await this.supabase
            .from('filiais')
            .update({ status: false })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = FilialRepository