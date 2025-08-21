'use strict'

const UsuarioFilialRepository = require('../Repositories/UsuarioFilialRepository')

class UsuarioFilialService {
    constructor() {
        this.repository = new UsuarioFilialRepository()
    }

    async getAllUsuarioFiliais() {
        try {
            return await this.repository.getAll()
        } catch (error) {
            console.error('Erro ao buscar usuario_filial:', error.message)
            throw new Error(`Erro ao buscar usuario_filial: ${error.message}`)
        }
    }

    async createUsuarioFilial(usuarioFilialData) {
        const { id_usuario, id_filial, is_representante } = usuarioFilialData

        if (!id_usuario || !id_filial) {
            await this.updateUsuarioFilial(id_usuario, id_filial, is_representante)
        }

        // Check if already exists
        const existing = await this.repository.getByUsuarioAndFilial(id_usuario, id_filial)
        if (existing) {
            throw new Error('Este usuário já está associado a esta filial.')
        }

        try {
            return await this.repository.create({
                id_usuario,
                id_filial,
                is_representante: is_representante || false // Default to false if not provided
            })
        } catch (error) {
            console.error('Erro ao criar usuario_filial:', error.message)
            throw new Error(`Erro ao criar usuario_filial: ${error.message}`)
        }
    }

    async getRepresentantesByFilial(idFilial) {
        if (!idFilial) {
            throw new Error('ID da filial é obrigatório')
        }
        try {
            return await this.repository.getRepresentantesByFilialId(idFilial)
        } catch (error) {
            console.error('Erro ao buscar representantes por filial no service:', error.message)
            throw new Error(`Erro ao buscar representantes por filial: ${error.message}`)
        }
    }

    async updateUsuarioFilial(idUsuario, idFilial, updateData) {
         // Check if the relationship exists before attempting to update
         const existing = await this.repository.getByUsuarioAndFilial(idUsuario, idFilial)
         if (!existing) {
            return await this.repository.create({
                id_usuario: idUsuario,
                id_filial: idFilial,
                is_representante: true
            })
         }

         // We only allow updating is_representante for now based on requirements
         // Validate updateData has the expected structure/fields
         if (updateData.is_representante === undefined) {
             throw new Error('Campo is_representante é obrigatório para atualização')
         }

         try {
            return await this.repository.updateUsuarioFilial(idUsuario, idFilial, {is_representante: updateData })
         } catch (error) {
            console.error('Erro ao atualizar usuario_filial no service:', error.message)
            throw new Error(`Erro ao atualizar usuario_filial: ${error.message}`)
         }
    }

    async deleteUsuarioFilial(idUsuario, idFilial) {
         // Check if the relationship exists before attempting to delete
         const existing = await this.repository.getByUsuarioAndFilial(idUsuario, idFilial)
         if (!existing) {
              throw new Error('Associação usuario_filial não encontrada')
         }

        try {
            return await this.repository.delete(idUsuario, idFilial)
        } catch (error) {
            console.error('Erro ao deletar usuario_filial:', error.message)
            throw new Error(`Erro ao deletar usuario_filial: ${error.message}`)
        }
    }
}

module.exports = UsuarioFilialService 