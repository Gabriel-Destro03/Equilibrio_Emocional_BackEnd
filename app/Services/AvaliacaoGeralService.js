'use strict'

const AvaliacaoGeralRepository = require('../Repositories/AvaliacaoGeralRepository')

class AvaliacaoGeralService {
    constructor() {
        this.repository = new AvaliacaoGeralRepository()
    }

    async getUltimaPorDepartamento(departamentoId) {
        return this.repository.getUltimaPorDepartamento(departamentoId)
    }
}

module.exports = AvaliacaoGeralService


