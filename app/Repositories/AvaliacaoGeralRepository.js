'use strict'

const Config = use('Config')

class AvaliacaoGeralRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getUltimaPorDepartamento(departamentoId) {
        if (!departamentoId) {
            throw new Error('ID do departamento é obrigatório')
        }

        const { data, error } = await this.supabase
            .from('avaliacao_geral')
            .select('*')
            .eq('departamento_id', departamentoId)
            .order('created_at', { ascending: false })
            .limit(1)

        if (error) throw new Error(error.message)

        return Array.isArray(data) && data.length ? data[0] : null
    }
}

module.exports = AvaliacaoGeralRepository


