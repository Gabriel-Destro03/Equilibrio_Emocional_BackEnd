'use strict'

const EmpresaRepository = require('../Repositories/EmpresaRepository')
const FilialRepository = require('../Repositories/FilialRepository')
const DepartamentoRepository = require('../Repositories/DepartamentoRepository')
const PermissaoService = require('./PermissaoService')
const IEmpresaService = require('../Interfaces/IEmpresaService')
const EmpresaDepartamentoFacade = require('../Facades/EmpresaDepartamentoFacade')

class EmpresaService extends IEmpresaService {
    constructor() {
        super()
        this.repository = new EmpresaRepository()
        this.filialRepository = new FilialRepository()
        this.departamentoRepository = new DepartamentoRepository()
        this.permissaoService = new PermissaoService()
        this.facade = new EmpresaDepartamentoFacade()
    }

    // Implementação dos métodos da interface IService
    async getAll() {
        return this.getAllEmpresas()
    }

    async getById(id) {
        return this.getEmpresaById(id)
    }

    async create(data) {
        return this.createEmpresa(data)
    }

    async update(id, data) {
        return this.updateEmpresa(id, data)
    }

    async inactivate(id) {
        return this.inactivateEmpresa(id)
    }

    // Métodos específicos mantidos para compatibilidade
    async getAllEmpresas() {
        try {
            return await this.repository.getAllEmpresas()
        } catch (error) {
            throw new Error(`Erro ao buscar empresas: ${error.message}`)
        }
    }

    async getEmpresaById(id) {
        if (!id) {
            throw new Error('ID da empresa é obrigatório')
        }
        try {
            const empresa = await this.repository.getEmpresaById(id)
            if (!empresa) {
                throw new Error('Empresa não encontrada')
            }
            return empresa
        } catch (error) {
            throw new Error(`Erro ao buscar empresa: ${error.message}`)
        }
    }

    async createEmpresa(empresaData) {
        // Usa o método de validação da interface
        await this.validateEmpresaData(empresaData, false)

        try {
            const empresa = await this.repository.createEmpresa({
                nome_fantasia: empresaData.nome_fantasia,
                razao_social: empresaData.razao_social,
                cnpj: empresaData.cnpj,
                ramo_atividade: empresaData.ramo_atividade,
                endereco: empresaData.endereco,
                bairro: empresaData.bairro,
                cidade: empresaData.cidade,
                estado: empresaData.estado,
                cep: empresaData.cep,
                pais: empresaData.pais,
                telefone: empresaData.telefone,
                email: empresaData.email,
                site: empresaData.site
                //status: empresaData.status,
                //plano: empresaData.plano,
                //logo_url: empresaData.logo_url,
                //responsaveis: empresaData.responsaveis,
            })

            // Usa o método da interface para gerenciar representantes
            await this.manageRepresentantes(empresa.id, empresaData.responsaveis || [])

            return empresa
        } catch (error) {
            throw new Error(`Erro ao criar empresa: ${error.message}`)
        }
    }

    async updateEmpresa(id, empresaData) {
        if (!id) {
            throw new Error('ID da empresa é obrigatório')
        }

        try {
            // Usa o método de validação da interface
            await this.validateEmpresaData(empresaData, true)

            const empresa = await this.repository.getEmpresaById(id)
            if (!empresa) {
                throw new Error('Empresa não encontrada')
            }
            
            await this.repository.updateEmpresa(id, {
                nome_fantasia: empresaData.nome_fantasia,
                razao_social: empresaData.razao_social,
                cnpj: empresaData.cnpj,
                ramo_atividade: empresaData.ramo_atividade,
                endereco: empresaData.endereco,
                bairro: empresaData.bairro,
                cidade: empresaData.cidade,
                estado: empresaData.estado,
                cep: empresaData.cep,
                pais: empresaData.pais,
                telefone: empresaData.telefone,
                email: empresaData.email,
                site: empresaData.site
            });

            // Usa o método da interface para gerenciar representantes
            if (empresaData.responsaveis) {
                await this.manageRepresentantes(id, empresaData.responsaveis)
            }

            return empresa
        } catch (error) {
            throw new Error(`Erro ao atualizar empresa: ${error.message}`)
        }
    }

    async inactivateEmpresa(id) {
        if (!id) {
            throw new Error('ID da empresa é obrigatório')
        }
        try {
            const empresa = await this.repository.getEmpresaById(id)
            if (!empresa) {
                throw new Error('Empresa não encontrada')
            }
            return await this.repository.inactivateEmpresa(id)
        } catch (error) {
            throw new Error(`Erro ao inativar empresa: ${error.message}`)
        }
    }

    async changeStatus(id, novoStatus) {
        if (!id) {
            throw new Error('ID da empresa é obrigatório')
        }
        try {
            const empresa = await this.repository.getEmpresaById(id)
            if (!empresa) {
                throw new Error('Empresa não encontrada')
            }
            return await this.repository.updateEmpresa(id, { status: novoStatus })
        } catch (error) {
            throw new Error(`Erro ao alterar status da empresa: ${error.message}`)
        }
    }


    async getRepresentantesByEmpresaId(empresaId) {
        if (!empresaId) {
            throw new Error('ID da empresa é obrigatório')
        }
        try {
            return await this.repository.getRepresentantesByEmpresaId(empresaId)
        } catch (error) {
            throw new Error(`Erro ao buscar representantes da empresa: ${error.message}`)
        }
    }

    // Implementações dos métodos da interface IEmpresaService
    async getByCnpj(cnpj) {
        try {
            return await this.repository.getEmpresaByCnpj(cnpj)
        } catch (error) {
            throw new Error(`Erro ao buscar empresa por CNPJ: ${error.message}`)
        }
    }

    async validateEmpresaData(empresaData, isUpdate = false) {
        if (!isUpdate) {
            const obrigatorios = ['nome_fantasia', 'razao_social', 'cnpj']
            for (const campo of obrigatorios) {
                if (!empresaData[campo]) {
                    throw new Error(`Campo obrigatório: ${campo}`)
                }
            }
            
            if (!Array.isArray(empresaData.responsaveis)) {
                throw new Error('Responsáveis deve ser um array')
            }
        }

        // Validação básica de CNPJ
        if (empresaData.cnpj && (typeof empresaData.cnpj !== 'string' || empresaData.cnpj.length < 14)) {
            throw new Error('CNPJ inválido')
        }

        // Verifica se já existe uma empresa com o mesmo CNPJ (apenas para criação ou se CNPJ mudou)
        if (empresaData.cnpj && !isUpdate) {
            const empresaExistente = await this.repository.getEmpresaByCnpj(empresaData.cnpj)
            if (empresaExistente) {
                throw new Error('Já existe uma empresa com este CNPJ')
            }
        }

        if (empresaData.responsaveis && !Array.isArray(empresaData.responsaveis)) {
            throw new Error('Responsáveis deve ser um array')
        }
    }

    async manageRepresentantes(empresaId, representantes) {
        const representantesAtuais = await this.repository.buscarRepresentantes(empresaId) || []
        const representantesInput = representantes || []

        // IDs dos representantes atuais
        const idsAtuais = representantesAtuais.map(r => r.usuario_id)
        // IDs dos representantes enviados na requisição
        const idsNovos = representantesInput.map(rep => rep.usuario_id || rep.id)

        // Para remover: quem está nos atuais mas não está nos novos
        const representantesRemover = representantesAtuais
          .filter(r => !idsNovos.includes(r.usuario_id))
          .map(r => ({
            usuario_id: r.usuario_id,
            empresa_id: empresaId
          }))

        // Para adicionar: quem está nos novos mas não está nos atuais
        const representantesAdicionar = representantesInput
          .filter(rep => !idsAtuais.includes(rep.usuario_id || rep.id))
          .map(rep => ({
            usuario_id: rep.usuario_id || rep.id,
            usuario_uid: rep.uid,
            empresa_id: empresaId
          }))

        if (representantesRemover.length > 0) {
            await this.repository.removerRepresentante(representantesRemover)
            // Gerenciar permissões após remoção
            for (const rep of representantesRemover) {
                await this.permissaoService.managePermissionsAfterRepresentativeRemoval(rep.usuario_id, 'rep_empresa')
            }
        }

        if (representantesAdicionar.length > 0) {
            await this.repository.criarRepresentante(representantesAdicionar)
            // Gerenciar permissões após adição
            for (const rep of representantesAdicionar) {
                await this.permissaoService.addRepresentativePermissions(rep.usuario_id, rep.usuario_uid, 'rep_empresa')
            }
        }
    }

    async getEmpresaFiliaisDepartamentos() {
        // Usa o Facade para simplificar a operação
        try {
            // Inicializa o facade com os services necessários
            const FilialService = require('./FilialService')
            const DepartamentoService = require('./DepartamentoService')
            
            const filialService = new FilialService()
            const departamentoService = new DepartamentoService()
            
            this.facade.initializeServices(this, departamentoService, filialService)
            
            return await this.facade.getEstruturaHierarquica()
        } catch (error) {
            throw new Error(`Erro ao buscar filiais e departamentos da empresa: ${error.message}`)
        }
    }

    async getEmpresaFiliaisDepartamentosByEmpresaId(empresaId) {
        // Usa o Facade para simplificar a operação
        try {
            // Inicializa o facade com os services necessários
            const FilialService = require('./FilialService')
            const DepartamentoService = require('./DepartamentoService')
            
            const filialService = new FilialService()
            const departamentoService = new DepartamentoService()
            
            this.facade.initializeServices(this, departamentoService, filialService)
            
            return await this.facade.getEstruturaHierarquica(empresaId)
        } catch (error) {
            throw new Error(`Erro ao buscar filiais e departamentos da empresa: ${error.message}`)
        }
    }
}

module.exports = EmpresaService 