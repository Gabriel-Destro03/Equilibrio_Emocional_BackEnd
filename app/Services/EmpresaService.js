'use strict'

const EmpresaRepository = require('../Repositories/EmpresaRepository')
const FilialRepository = require('../Repositories/FilialRepository')
const DepartamentoRepository = require('../Repositories/DepartamentoRepository')

class EmpresaService {
    constructor() {
        this.repository = new EmpresaRepository()
        this.filialRepository = new FilialRepository()
        this.departamentoRepository = new DepartamentoRepository()
    }

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
        const obrigatorios = ['nome_fantasia', 'razao_social', 'cnpj']
        for (const campo of obrigatorios) {
            if (!empresaData[campo]) {
                throw new Error(`Campo obrigatório: ${campo}`)
            }
        }
        if (!Array.isArray(empresaData.responsaveis)) {
            throw new Error('Responsáveis deve ser um array')
        }
        // Validação básica de CNPJ
        if (typeof empresaData.cnpj !== 'string' || empresaData.cnpj.length < 14) {
            throw new Error('CNPJ inválido')
        }
        // Verifica se já existe uma empresa com o mesmo CNPJ
        const empresaExistente = await this.repository.getEmpresaByCnpj(empresaData.cnpj)
        if (empresaExistente) {
            throw new Error('Já existe uma empresa com este CNPJ')
        }

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

            const representantes = await this.repository.buscarRepresentantes(empresa.id) || []
            const representantesInput = empresaData.responsaveis || []

            const representantesRemover = representantes.filter(r => 
                !representantesInput.some(rep => rep.id === r.id)
            ).map(r => ({
                usuario_id: r.id,
                empresa_id: empresa.id
            }))

            const representantesAdicionar = representantesInput.filter(rep => 
                !representantes.some(r => r.id === rep.id)
            ).map(rep => ({
                usuario_id: rep.id,
                empresa_id: empresa.id
            }))

            await this.repository.removerRepresentante(representantesRemover)
            await this.repository.criarRepresentante(representantesAdicionar)

            return empresa
        } catch (error) {
            throw new Error(`Erro ao criar empresa: ${error.message}`)
        }
    }

    async updateEmpresa(id, empresaData) {
        if (!id) {
            throw new Error('ID da empresa é obrigatório')
        }
        if (empresaData.cnpj && (typeof empresaData.cnpj !== 'string' || empresaData.cnpj.length < 14)) {
            throw new Error('CNPJ inválido')
        }
        if (empresaData.responsaveis && !Array.isArray(empresaData.responsaveis)) {
            throw new Error('Responsáveis deve ser um array')
        }
        try {
            const empresa = await this.repository.getEmpresaById(id)
            if (!empresa) {
                throw new Error('Empresa não encontrada')
            }
            return await this.repository.updateEmpresa(id, empresaData)
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

    async getEmpresaFiliaisDepartamentos(){
        try {            
            const empresas = await this.repository.getAllEmpresas();

            empresas.forEach(async (empresa) => {
                const filiais = await this.filialRepository.getFiliaisByEmpresaId(empresa.id);
                filiais.forEach(async (filial) => {
                    const departamentos = await this.departamentoRepository.getDepartamentosByFilial(filial.id);
                    filial.departamentos = departamentos;
                });
                empresa.filiais = filiais;
            });
                
            return empresas
        } catch (error) {
            throw new Error(`Erro ao buscar filiais e departamentos da empresa: ${error.message}`)
        }
    }

    async getEmpresaFiliaisDepartamentosByEmpresaId(empresaId){
        try {            
            const empresa = await this.repository.getEmpresaById(empresaId);

            const filiais = await this.filialRepository.getFiliaisByEmpresaId(empresaId);
                filiais.forEach(async (filial) => {
                    const departamentos = await this.departamentoRepository.getDepartamentosByFilial(filial.id);
                    filial.departamentos = departamentos;
                });
                empresa.filiais = filiais;
                
            return empresa
        } catch (error) {
            throw new Error(`Erro ao buscar filiais e departamentos da empresa: ${error.message}`)
        }
    }
    
}

module.exports = EmpresaService 