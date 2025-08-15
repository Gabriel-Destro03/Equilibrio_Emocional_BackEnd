'use strict'

const DashboardService = require('../../../Services/DashboardService');

class DashboardController {
    constructor() {
        this.service = new DashboardService();
    }

    async getDashboardData({ request, response }) {
        try {
            const dashboardData = request.only(['uid', 'type', 'filialId', 'empresaId'])

            const data = await this.service.getDashboardData(dashboardData);

            return response.status(200).json(data)
        } catch (error) {
            console.error('Erro no getDashboardData:', error)
            return response.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar dados do dashboard'
            })
        }
    }

    async getEngajamento({ request, response }){
        try {
            const dashboardData = request.only(['uid', 'type', 'filialId', 'empresaId'])

            const data = await this.service.getEngajamento(dashboardData);

            return response.status(200).json(data)
        } catch (error) {
            console.error('Erro no Engajamento:', error)
            return response.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar dados do dashboard'
            })
        }
    }

    async getTendencias({ request, response }){
        try {
            const dashboardData = request.only(['uid', 'type', 'filialId', 'empresaId'])

            const data = await this.service.getTendencias(dashboardData);

            return response.status(200).json(data)
        } catch (error) {
            console.error('Erro nas Tendências:', error)
            return response.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar dados do dashboard'
            })
        }
    }
}

module.exports = DashboardController;