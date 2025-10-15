'use strict'

const IEmpresaService = require('../Interfaces/IEmpresaService')
const IDepartamentoService = require('../Interfaces/IDepartamentoService')

/**
 * Facade para operações complexas entre empresa e departamento
 * Centraliza a lógica de negócio que envolve múltiplos services
 */
class EmpresaDepartamentoFacade {
    constructor() {
        this.empresaService = null
        this.departamentoService = null
        this.filialService = null
    }

    /**
     * Inicializa os services necessários
     * @param {IEmpresaService} empresaService
     * @param {IDepartamentoService} departamentoService
     * @param {Object} filialService
     */
    initializeServices(empresaService, departamentoService, filialService) {
        this.empresaService = empresaService
        this.departamentoService = departamentoService
        this.filialService = filialService
    }

    /**
     * Busca estrutura hierárquica completa: empresa -> filiais -> departamentos
     * @param {number|null} empresaId - ID da empresa (se null, busca todas)
     * @returns {Promise<Object|Array>} Estrutura hierárquica
     */
    async getEstruturaHierarquica(empresaId = null) {
        this._validateServices()

        try {
            if (empresaId) {
                return await this._getEstruturaHierarquicaByEmpresaId(empresaId)
            } else {
                return await this._getEstruturaHierarquicaCompleta()
            }
        } catch (error) {
            throw new Error(`Erro ao buscar estrutura hierárquica: ${error.message}`)
        }
    }

    /**
     * Cria departamento validando se a filial pertence à empresa
     * @param {Object} departamentoData - Dados do departamento
     * @param {number} empresaId - ID da empresa (para validação)
     * @returns {Promise<Object>} Departamento criado
     */
    async criarDepartamentoComValidacao(departamentoData, empresaId) {
        this._validateServices()

        try {
            // Valida se a filial pertence à empresa
            const isValid = await this.departamentoService.validateFilialBelongsToEmpresa(
                departamentoData.id_filial, 
                empresaId
            )

            if (!isValid) {
                throw new Error('A filial informada não pertence à empresa')
            }

            // Valida dados do departamento
            await this.departamentoService.validateDepartamentoData(departamentoData)

            return await this.departamentoService.create(departamentoData)
        } catch (error) {
            throw new Error(`Erro ao criar departamento: ${error.message}`)
        }
    }

    /**
     * Busca departamentos por empresa com informações adicionais
     * @param {number} empresaId - ID da empresa
     * @returns {Promise<Array>} Departamentos com informações de filial
     */
    async getDepartamentosByEmpresaWithDetails(empresaId) {
        this._validateServices()

        try {
            // Busca filiais da empresa
            const filiais = await this.filialService.getFiliaisByEmpresaId(empresaId)
            
            if (!filiais || filiais.length === 0) {
                return []
            }

            // Busca departamentos de todas as filiais
            const filiaisId = filiais.map(f => f.id)
            const departamentos = await this.departamentoService.getDepartamentosByFiliaisId(filiaisId)

            // Adiciona informações da filial a cada departamento
            return departamentos.map(departamento => {
                const filial = filiais.find(f => f.id === departamento.id_filial)
                return {
                    ...departamento,
                    filial: filial || null
                }
            })
        } catch (error) {
            throw new Error(`Erro ao buscar departamentos da empresa: ${error.message}`)
        }
    }

    /**
     * Valida e obtém estrutura completa para operações CRUD
     * @param {number} empresaId - ID da empresa
     * @returns {Promise<Object>} Estrutura validada
     */
    async validarEstruturaEmpresa(empresaId) {
        this._validateServices()

        try {
            const empresa = await this.empresaService.getById(empresaId)
            if (!empresa) {
                throw new Error('Empresa não encontrada')
            }

            const filiais = await this.filialService.getFiliaisByEmpresaId(empresaId)
            const departamentos = await this.getDepartamentosByEmpresaWithDetails(empresaId)

            return {
                empresa,
                filiais,
                departamentos,
                totalFiliais: filiais.length,
                totalDepartamentos: departamentos.length
            }
        } catch (error) {
            throw new Error(`Erro ao validar estrutura da empresa: ${error.message}`)
        }
    }

    /**
     * Busca estrutura hierárquica completa (todas as empresas)
     * @private
     */
    async _getEstruturaHierarquicaCompleta() {
        const empresas = await this.empresaService.getAll()

        // Processa cada empresa de forma assíncrona
        const empresaPromises = empresas.map(async (empresa) => {
            const filiais = await this.filialService.getFiliaisByEmpresaId(empresa.id)
            
            const filialPromises = filiais.map(async (filial) => {
                const departamentos = await this.departamentoService.getDepartamentosByFilial(filial.id)
                return { ...filial, departamentos }
            })

            const filiaisComDepartamentos = await Promise.all(filialPromises)
            return { ...empresa, filiais: filiaisComDepartamentos }
        })

        return Promise.all(empresaPromises)
    }

    /**
     * Busca estrutura hierárquica de uma empresa específica
     * @private
     */
    async _getEstruturaHierarquicaByEmpresaId(empresaId) {
        const empresa = await this.empresaService.getById(empresaId)
        if (!empresa) {
            throw new Error('Empresa não encontrada')
        }

        const filiais = await this.filialService.getFiliaisByEmpresaId(empresaId)
        
        const filialPromises = filiais.map(async (filial) => {
            const departamentos = await this.departamentoService.getDepartamentosByFilial(filial.id)
            return { ...filial, departamentos }
        })

        const filiaisComDepartamentos = await Promise.all(filialPromises)
        return { ...empresa, filiais: filiaisComDepartamentos }
    }

    /**
     * Valida se os services foram inicializados
     * @private
     */
    _validateServices() {
        if (!this.empresaService || !this.departamentoService || !this.filialService) {
            throw new Error('Services não foram inicializados. Chame initializeServices() primeiro.')
        }
    }
}

module.exports = EmpresaDepartamentoFacade
