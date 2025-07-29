'use strict'

const DepartamentoService = require('../../../Services/DepartamentoService')

class DepartamentoController {
    constructor() {
        this.service = new DepartamentoService()
    }

    /**
     * Lista todos os departamentos ativos
     */
    async index({ response }) {
        try {
            const departamentos = await this.service.getAllDepartamentos()
            return response.status(200).json(departamentos)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca um departamento específico
     */
    async show({ params, response }) {
        try {
            const departamento = await this.service.getDepartamentoById(params.id)
            return response.status(200).json(departamento)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Lista departamentos por filial
     */
    async getByFilial({ params, response }) {
        try {
            const departamentos = await this.service.getDepartamentosByFilial(params.filialId)
            return response.status(200).json(departamentos)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Lista departamentos por empresa
     */
    async getByEmpresaId({ params, response }) {
        try {
            const departamentos = await this.service.getByEmpresaId(params.empresa_id)
            return response.status(200).json(departamentos)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Cria um novo departamento
     */
    async store({ request, response }) {
        try {
            const departamentoData = request.only(['nome_departamento', 'id_filial'])

            const departamento = await this.service.createDepartamento(departamentoData)
            return response.status(201).json(departamento)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Atualiza um departamento existente
     */
    async update({ params, request, response }) {
        try {
            const departamentoData = request.only(['nome_departamento', 'filial_id'])
            const departamento = await this.service.updateDepartamento(params.id, departamentoData)
            return response.status(200).json(departamento)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Inativa um departamento
     */
    async destroy({ params, response }) {
        try {
            await this.service.inactivateDepartamento(params.id)
            return response.status(200).json({ message: 'Departamento inativado com sucesso' })
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Altera o status do departamento
     */
    async changeStatus({ params, response }) {
        try {
            const departamento = await this.service.getDepartamentoById(params.id)
            if (!departamento) {
                return response.status(404).json({ error: 'Departamento não encontrado' })
            }

            const novoStatus = !departamento.status
            const departamentoAtualizado = await this.service.changeStatus(params.id, novoStatus)
            return response.status(200).json(departamentoAtualizado)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Lista todos os departamentos de um usuário específico
     */
    async getDepartamentosByUser({ params, response }) {
        try {
            const departamentos = await this.service.getDepartamentosByUserId(params.uid)
            return response.status(200).json(departamentos)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = DepartamentoController 