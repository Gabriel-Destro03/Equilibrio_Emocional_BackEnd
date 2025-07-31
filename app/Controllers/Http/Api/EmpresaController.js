'use strict'

const EmpresaService = require('../../../Services/EmpresaService')

class EmpresaController {
    constructor() {
        this.service = new EmpresaService()
    }

    /**
     * Lista todas as empresas
     */
    async index({ response }) {
        try {
            const empresas = await this.service.getAllEmpresas()
            return response.status(200).json(empresas)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca uma empresa específica
     */
    async show({ params, response }) {
        try {
            const empresa = await this.service.getEmpresaById(params.id)
            return response.status(200).json(empresa)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Cria uma nova empresa
     */
    async store({ request, response }) {
        try {
            const empresaData = request.only([
                'nome_fantasia', 'razao_social', 'cnpj', 'ramo_atividade',
                'endereco', 'bairro', 'cidade', 'estado', 'cep', 'pais',
                'telefone', 'email', 'site', 'status', 'plano', 'logo_url', 'responsaveis'
            ])
            const empresa = await this.service.createEmpresa(empresaData)
            return response.status(201).json(empresa)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Atualiza uma empresa existente
     */
    async update({ params, request, response }) {
        try {
            const empresaData = request.only([
                'nome_fantasia', 'razao_social', 'cnpj', 'ramo_atividade',
                'endereco', 'bairro', 'cidade', 'estado', 'cep', 'pais',
                'telefone', 'email', 'site', 'status', 'plano', 'logo_url', 'responsaveis'
            ])
            const empresa = await this.service.updateEmpresa(params.id, empresaData)
            return response.status(200).json(empresa)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Inativa uma empresa
     */
    async destroy({ params, response }) {
        try {
            await this.service.inactivateEmpresa(params.id)
            return response.status(200).json({ message: 'Empresa inativada com sucesso' })
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Altera o status da empresa
     */
    async changeStatus({ params, response }) {
        try {
            const empresa = await this.service.getEmpresaById(params.id)
            if (!empresa) {
                return response.status(404).json({ error: 'Empresa não encontrada' })
            }
            const novoStatus = empresa.status === 'ativo' ? 'inativo' : 'ativo'
            const empresaAtualizada = await this.service.changeStatus(params.id, novoStatus)
            return response.status(200).json(empresaAtualizada)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Retorna empresas com suas filiais e departamentos no formato hierárquico
     */
    async getEmpresaFiliaisDepartamentos({ response }) {
        try {
            const empresas = await this.service.getEmpresaFiliaisDepartamentos();
            return response.status(200).json(empresas);
        } catch (error) {
            return response.status(400).json({ error: error.message });
        }
    }

    /**
     * Retorna uma empresa específica com suas filiais e departamentos no formato hierárquico
     */
    async getEmpresaFiliaisDepartamentosByEmpresaId({ params, response }) {
        try {
            const empresa = await this.service.getEmpresaFiliaisDepartamentosByEmpresaId(params.id);
            return response.status(200).json(empresa);
        } catch (error) {
            return response.status(400).json({ error: error.message });
        }
    }

    /**
     * Lista representantes de uma empresa
     */
    async getRepresentantesByEmpresaId({ params, response }) {
        try {
            const representantes = await this.service.getRepresentantesByEmpresaId(params.id)
            return response.status(200).json(representantes)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = EmpresaController 