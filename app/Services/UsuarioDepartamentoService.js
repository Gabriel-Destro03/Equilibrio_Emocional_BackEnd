'use strict'

const UsuarioDepartamentoRepository = use('App/Repositories/UsuarioDepartamentoRepository')

class UsuarioDepartamentoService {
    constructor() {
        this.repository = new UsuarioDepartamentoRepository()
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
            throw new Error('Este usuário já está associado a este departamento.')
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

    async updateUsuarioDepartamento(idUsuario, idDepartamento, updateData) {
         // Check if the relationship exists before attempting to update
         const existing = await this.repository.getByUsuarioAndDepartamento(idUsuario, idDepartamento)
         if (!existing) {
              throw new Error('Associação usuario_departamento não encontrada')
         }

         // We only allow updating is_representante for now based on requirements
         // Validate updateData has the expected structure/fields
         if (updateData.is_representante === undefined) {
             throw new Error('Campo is_representante é obrigatório para atualização')
         }

         try {
            return await this.repository.update(idUsuario, idDepartamento, { is_representante: updateData.is_representante })
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