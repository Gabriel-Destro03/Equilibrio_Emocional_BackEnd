'use strict'

const UsuarioDepartamentoRepository = require('../Repositories/UsuarioDepartamentoRepository')
const PermissaoService = require('./PermissaoService')

class UsuarioDepartamentoService {
    constructor() {
        this.repository = new UsuarioDepartamentoRepository()
        this.permissaoService = new PermissaoService()
    }

    async getAllUsuarioDepartamentos() {
        try {
            return await this.repository.getAll()
        } catch (error) {
            console.error('Erro ao buscar usuario_departamento:', error.message)
            throw new Error(`Erro ao buscar usuario_departamento: ${error.message}`)
        }
    }

    async createUsuarioDepartamento(usuarioDepartamentoData) {
        const { id_usuario, id_departamento, is_representante } = usuarioDepartamentoData

        if (!id_usuario || !id_departamento) {
            throw new Error('id_usuario e id_departamento são obrigatórios')
        }

        // Check if already exists
        const existing = await this.repository.getByUsuarioAndDepartamento(id_usuario, id_departamento)
        if (existing) {
            await this.updateUsuarioDepartamento(id_usuario, id_departamento, is_representante)
        }

        try {
            return await this.repository.create({
                id_usuario,
                id_departamento,
                is_representante: is_representante || false // Default to false if not provided
            })
        } catch (error) {
            console.error('Erro ao criar usuario_departamento:', error.message)
            throw new Error(`Erro ao criar usuario_departamento: ${error.message}`)
        }
    }

    async getRepresentantesByDepartamento(idDepartamento) {
        if (!idDepartamento) {
            throw new Error('ID do departamento é obrigatório')
        }
        try {
            return await this.repository.getRepresentantesByDepartamentoId(idDepartamento)
        } catch (error) {
            console.error('Erro ao buscar representantes por departamento no service:', error.message)
            throw new Error(`Erro ao buscar representantes por departamento: ${error.message}`)
        }
    }

    async updateUsuarioDepartamento(id_usuario, id_departamento, is_representante) {
        try {
            // Check if the relationship exists before attempting to update
            const existing = await this.repository.getByUsuarioAndDepartamento(id_usuario, id_departamento)
            if (!existing) {
                return await this.repository.create({
                    id_usuario,
                    id_departamento,
                    is_representante: is_representante || false
                })
            }

            // Atualiza o status de representante no banco
            const result = await this.repository.update(id_usuario, id_departamento, { is_representante })

            // Gerenciar permissões baseado no novo status
            if (is_representante === true) {
                // Buscar UID do usuário
                const usuarioData = await this.repository.getUserUid(id_usuario)
                // Adicionar permissões de representante de departamento
                await this.permissaoService.addRepresentativePermissions(id_usuario, usuarioData.uid, 'rep_departamento')
            } else if (is_representante === false) {
                // Remover permissões de representante de departamento
                await this.permissaoService.managePermissionsAfterRepresentativeRemoval(id_usuario, 'rep_departamento')
            }

            return result
        } catch (error) {
            console.error('Erro ao atualizar usuario_departamento no service:', error.message)
            throw new Error(`Erro ao atualizar usuario_departamento: ${error.message}`)
        }
    }

    async deleteUsuarioDepartamento(idUsuario, idDepartamento) {
         // Check if the relationship exists before attempting to delete
         const existing = await this.repository.getByUsuarioAndDepartamento(idUsuario, idDepartamento)
         if (!existing) {
              throw new Error('Associação usuario_departamento não encontrada')
         }

        try {
            return await this.repository.delete(idUsuario, idDepartamento)
        } catch (error) {
            console.error('Erro ao deletar usuario_departamento:', error.message)
            throw new Error(`Erro ao deletar usuario_departamento: ${error.message}`)
        }
    }
}

module.exports = UsuarioDepartamentoService 