'use strict'

const Config = use('Config')

class DashboardRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getDashboardData() {
       const { data, error } = await this.supabase.rpc('get_relatorio_jornada');

       if (error) {
        throw new Error(error.message || 'Erro ao buscar dados do dashboard')
       }

       return data;
    }

}

module.exports = DashboardRepository;