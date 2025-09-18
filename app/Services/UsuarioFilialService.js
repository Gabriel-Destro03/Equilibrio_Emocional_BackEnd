'use strict'

const UsuarioFilialRepository = require('../Repositories/UsuarioFilialRepository')
const UsuarioRepository = require('../Repositories/UsuarioRepository')
const UsuarioDepartamentoRepository = require('../Repositories/UsuarioDepartamentoRepository')

class UsuarioFilialService {
    constructor() {
        this.repository = new UsuarioFilialRepository()
        this.usuarioRepository = new UsuarioRepository()
        this.usuarioDepartamentoRepository = new UsuarioDepartamentoRepository()
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
            throw new Error('id_usuario e id_filial são obrigatórios')
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
            throw new Error('Associação usuario_filial não encontrada')
        }

        if (updateData.is_representante === undefined) {
            throw new Error('Campo is_representante é obrigatório para atualização')
        }

        // Buscar usuário para obter UID
        const usuario = await this.usuarioRepository.getUsuarioById(idUsuario)
        if (!usuario || !usuario.uid) {
            throw new Error('Usuário ou UID não encontrado')
        }
        const uid = usuario.uid

        try {
            // 1) Atualiza o vínculo
            const updated = await this.repository.updateUsuarioFilial(idUsuario, idFilial, { is_representante: updateData.is_representante })

            // 2) Regras de permissões
            if (updateData.is_representante === true) {
                await this._handleAdicaoPermissoesFilial(idUsuario, uid)
            } else {
                await this._handleRemocaoPermissoesFilial(idUsuario)
            }

            return updated
        } catch (error) {
            console.error('Erro ao atualizar usuario_filial no service:', error.message)
            throw new Error(`Erro ao atualizar usuario_filial: ${error.message}`)
        }
    }

    // Adiciona permissões de representante de filial que estiverem faltando
    async _handleAdicaoPermissoesFilial(idUsuario, uid) {
        const currentPerms = await this.usuarioRepository.getUserPermissions(uid)
        const currentIds = Array.isArray(currentPerms)
            ? currentPerms.map(p => p.id_permissao).filter(Boolean)
            : []

        const requiredIds = [1, 3, 4, 5]
        const missingIds = requiredIds.filter(id => !currentIds.includes(id))

        if (missingIds.length > 0) {
            await this.usuarioDepartamentoRepository.addUserPermissions(idUsuario, uid, missingIds)
        }
    }

    // Remove permissões quando usuário não é mais representante
    async _handleRemocaoPermissoesFilial(idUsuario) {
        // Se não é representante em nenhuma filial, remove permissões de filial
        const isRepAlgumaFilial = await this.repository.userHasAnyFilialRepresentante(idUsuario)
        if (!isRepAlgumaFilial) {
            await this.usuarioDepartamentoRepository.removeUserPermissions(idUsuario, [1, 3, 4, 5])
        }

        // Se não é representante em nenhum departamento, remove permissão de departamento
        const isRepAlgumDepartamento = await this.usuarioDepartamentoRepository.userHasAnyDepartamentoRepresentante(idUsuario)
        if (!isRepAlgumDepartamento) {
            await this.usuarioDepartamentoRepository.removeUserPermissions(idUsuario, [6])
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