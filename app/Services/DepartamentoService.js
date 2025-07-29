'use strict'

const DepartamentoRepository = require('../Repositories/DepartamentoRepository')
const FilialService = require('./FilialService')

class DepartamentoService {
    constructor() {
        this.repository = new DepartamentoRepository()
        this.filialService = new FilialService()
    }

    async getAllDepartamentos() {
        try {
            return await this.repository.getAllDepartamentos()
        } catch (error) {
            throw new Error(`Erro ao buscar departamentos: ${error.message}`)
        }
    }

    async getDepartamentoById(id) {
        if (!id) {
            throw new Error('ID do departamento é obrigatório')
        }

        try {
            const departamento = await this.repository.getDepartamentoById(id)
            if (!departamento) {
                throw new Error('Departamento não encontrado')
            }
            return departamento
        } catch (error) {
            throw new Error(`Erro ao buscar departamento: ${error.message}`)
        }
    }

    async getDepartamentosByFilial(filialId) {
        if (!filialId) {
            throw new Error('ID da filial é obrigatório')
        }

        try {
            return await this.repository.getDepartamentosByFilial(filialId)
        } catch (error) {
            throw new Error(`Erro ao buscar departamentos da filial: ${error.message}`)
        }
    }

    async getByEmpresaId(empresa_id) {
        if (!empresa_id) {
            throw new Error('ID da empresa é obrigatório')
        }

        try {
            const filiais = await this.filialService.getFiliaisByEmpresaId(empresa_id);
            if(filiais.length == 0) return [];

            const filiaisId = filiais.map(f => f.id);
            
            return await this.repository.getDepartamentosByFiliaisId(filiaisId)
        } catch (error) {
            throw new Error(`Erro ao buscar departamentos da empresa: ${error.message}`)
        }
    }

    
    async createDepartamento(departamentoData) {
        const { nome_departamento, id_filial } = departamentoData

        if (!nome_departamento || !id_filial) {
            throw new Error('Nome do departamento e ID da filial são obrigatórios')
        }

        try {
            return await this.repository.createDepartamento({
                nome_departamento,
                id_filial
            })
        } catch (error) {
            throw new Error(`Erro ao criar departamento: ${error.message}`)
        }
    }

    async updateDepartamento(id, departamentoData) {
        if (!id) {
            throw new Error('ID do departamento é obrigatório')
        }

        const { nome_departamento, filial_id } = departamentoData

        if (!nome_departamento && !filial_id) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        try {
            const departamento = await this.repository.getDepartamentoById(id)
            if (!departamento) {
                throw new Error('Departamento não encontrado')
            }

            return await this.repository.updateDepartamento(id, departamentoData)
        } catch (error) {
            throw new Error(`Erro ao atualizar departamento: ${error.message}`)
        }
    }

    async inactivateDepartamento(id) {
        if (!id) {
            throw new Error('ID do departamento é obrigatório')
        }

        try {
            const departamento = await this.repository.getDepartamentoById(id)
            if (!departamento) {
                throw new Error('Departamento não encontrado')
            }

            return await this.repository.inactivateDepartamento(id)
        } catch (error) {
            throw new Error(`Erro ao inativar departamento: ${error.message}`)
        }
    }

    async changeStatus(id, novoStatus) {
        if (!id) {
            throw new Error('ID do departamento é obrigatório')
        }

        try {
            const departamento = await this.repository.getDepartamentoById(id)
            if (!departamento) {
                throw new Error('Departamento não encontrado')
            }

            return await this.repository.updateDepartamento(id, { status: novoStatus })
        } catch (error) {
            throw new Error(`Erro ao alterar status do departamento: ${error.message}`)
        }
    }

    async getDepartamentosByUserId(uid) {
        if (!uid) {
            throw new Error('ID do usuário é obrigatório')
        }

        try {
            return await this.repository.getDepartamentosByUserId(uid)
        } catch (error) {
            throw new Error(`Erro ao buscar departamentos do usuário: ${error.message}`)
        }
    }
}

module.exports = DepartamentoService 