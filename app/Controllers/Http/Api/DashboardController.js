'use strict'

const DashboardService = require('../../../Services/DashboardService');

class DashboardController {
    constructor() {
        this.service = new DashboardService();
    }

    async getDashboardData({ params, response }) {
        try {
            const uid  = params.uid;
            const type  = params.type;

            const data = await this.service.getDashboardData(uid, type);

            return response.status(200).json(data)
        } catch (error) {
            console.error('Erro no getDashboardData:', error)
            return response.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar dados do dashboard'
            })
        }
    }
}

module.exports = DashboardController;