'use strict'

const EmpresaRepository = require('../Repositories/EmpresaRepository')
const FilialRepository = require('../Repositories/FilialRepository')
const DepartamentoRepository = require('../Repositories/DepartamentoRepository')
const PermissaoService = require('./PermissaoService')

class EmpresaService {
    constructor() {
        this.repository = new EmpresaRepository()
        this.filialRepository = new FilialRepository()
        this.departamentoRepository = new DepartamentoRepository()
        this.permissaoService = new PermissaoService()
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

            // IDs dos representantes atuais
            const idsAtuais = representantes.map(r => r.usuario_id)
            // IDs dos representantes enviados na requisição
            const idsNovos = representantesInput.map(rep => rep.usuario_id)

            // Para remover: quem está nos atuais mas não está nos novos
            const representantesRemover = representantes
              .filter(r => !idsNovos.includes(r.usuario_id))
              .map(r => ({
                usuario_id: r.usuario_id,
                empresa_id: empresa.id
              }))

            // Para adicionar: quem está nos novos mas não está nos atuais
            const representantesAdicionar = representantesInput
              .filter(rep => !idsAtuais.includes(rep.usuario_id))
              .map(rep => ({
                usuario_id: rep.usuario_id,
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

            // Atualização de representantes

            const representantes = await this.repository.buscarRepresentantes(empresa.id) || []

            const representantesInput = empresaData.responsaveis || []
            

            // IDs dos representantes atuais
            const idsAtuais = representantes.map(r => r.usuario_id)
            // IDs dos representantes enviados na requisição
            const idsNovos = representantesInput.map(rep => rep.id)
            
            // Para remover: quem está nos atuais mas não está nos novos
            const representantesRemover = representantes
              .filter(r => !idsNovos.includes(r.usuario_id))
              .map(r => ({
                usuario_id: r.usuario_id,
                empresa_id: empresa.id
              }))
              
            // Para adicionar: quem está nos novos mas não está nos atuais
            const representantesAdicionar = representantesInput
              .filter(rep => !idsAtuais.includes(rep.id))
              .map(rep => {
                return {
                  usuario_id: rep.id,
                  usuario_uid: rep.uid,
                  empresa_id: empresa.id
                }
              })
            
              
            if(representantesRemover.length > 0){
                await this.repository.removerRepresentante(representantesRemover)
                // Gerenciar permissões após remoção
                for (const rep of representantesRemover) {
                    await this.permissaoService.managePermissionsAfterRepresentativeRemoval(rep.usuario_id, 'rep_empresa')
                }
            }
            if(representantesAdicionar.length > 0){
                await this.repository.criarRepresentante(representantesAdicionar)
                // Gerenciar permissões após adição
                for (const rep of representantesAdicionar) {
                    await this.permissaoService.addRepresentativePermissions(rep.usuario_id, rep.usuario_uid, 'rep_empresa')
                }
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
    
}

module.exports = EmpresaService 