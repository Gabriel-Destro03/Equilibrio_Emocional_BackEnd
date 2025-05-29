'use strict'

const Config = use('Config')

class DepartamentoRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllDepartamentos() {
        const { data, error } = await this.supabase
            .from('departamentos')
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)

        if (error) throw new Error(error.message)
        return data
    }

    async getDepartamentoById(id) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .eq('id', id)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getDepartamentosByFilial(filialId) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .eq('filial_id', filialId)

        if (error) throw new Error(error.message)
        return data
    }

    async createDepartamento(departamentoData) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .insert([{ ...departamentoData, status: true }])
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async updateDepartamento(id, departamentoData) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .update(departamentoData)
            .eq('id', id)
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async inactivateDepartamento(id) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .update({ status: false })
            .eq('id', id)
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = DepartamentoRepository 