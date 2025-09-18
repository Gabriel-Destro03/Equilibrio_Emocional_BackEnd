'use strict'

const UsuarioDepartamentoRepository = use('App/Repositories/UsuarioDepartamentoRepository')
const UsuarioRepository = use('App/Repositories/UsuarioRepository')
const UsuarioFilialRepository = use('App/Repositories/UsuarioFilialRepository')

class UsuarioDepartamentoService {
    constructor() {
        this.repository = new UsuarioDepartamentoRepository()
        this.usuarioRepository = new UsuarioRepository()
        this.usuarioFilialRepository = new UsuarioFilialRepository()
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
            // 1. Busca o departamento
            const departamento = await this.repository.getDepartamentoById(idDepartamento)
            
            // 2. Busca todos os usuários da filial
            const usuariosFilial = await this.repository.getUsuariosByFilialId(departamento.id_filial)
            
            // 3. Busca todos os usuários do departamento
            const usuariosDepartamento = await this.repository.getUsuariosByDepartamentoId(departamento.id)
            
            // 4. Cria um map para verificar rapidamente se o usuário é representante
            const representantesMap = new Map(
                usuariosDepartamento.map(u => [u.id_usuario, u])
            )
            
            // 5. Monta retorno no formato desejado (regra de negócio)
            const usuarios = usuariosFilial.map(u => {
                const representante = representantesMap.get(u.id_usuario)
                return {
                    id: representante?.id || u.id,
                    id_usuario: u.id_usuario,
                    id_departamento: representante?.id_departamento || departamento.id,
                    created_at: u.created_at,
                    status: u.status,
                    is_representante: representante?.is_representante || false,
                    usuarios: u.usuarios
                }
            })
            
            return usuarios
        } catch (error) {
            console.error('Erro ao buscar representantes por departamento no service:', error.message)
            throw new Error(`Erro ao buscar representantes por departamento: ${error.message}`)
        }
    }

    async updateUsuarioDepartamento(idUsuario, idDepartamento, updateData) {
        if (!updateData || updateData.is_representante === undefined) {
            throw new Error('Campo is_representante é obrigatório para atualização')
        }
    
        // 1) Valida usuário
        const usuario = await this.usuarioRepository.getUsuarioById(idUsuario)
        if (!usuario) {
            throw new Error('Usuário não encontrado')
        }
    
        // 2) Verifica se o vínculo existe, caso contrário cria
        let vinculo = await this.repository.getByUsuarioAndDepartamento(idUsuario, idDepartamento)
        if (!vinculo || vinculo.length === 0) {
            vinculo = await this.repository.create({
                id_usuario: idUsuario,
                id_departamento: idDepartamento,
                is_representante: false
            })
        }
    
        try {
            // 3) Atualizar o vínculo
            const updated = await this.repository.update(
                idUsuario,
                idDepartamento,
                { is_representante: updateData.is_representante }
            )
    
            if (updateData.is_representante === false) {
                await this._handleRemocaoPermissoes(idUsuario)
            } else {
                await this._handleAdicaoPermissoes(idUsuario, usuario.uid)
            }
    
            return updated
        } catch (error) {
            console.error('Erro ao atualizar usuario_departamento no service:', error.message)
            throw new Error(`Erro ao atualizar usuario_departamento: ${error.message}`)
        }
    }
    
    /**
     * Remove permissões caso o usuário não seja mais representante
     */
    async _handleRemocaoPermissoes(idUsuario) {
        // Verifica se ainda é representante de outro departamento
        const aindaRepDepto = await this.repository.userHasAnyDepartamentoRepresentante(idUsuario)
        if (!aindaRepDepto) {
            await this.repository.removeUserPermissions(idUsuario, [6])
        }
    
        // Verifica se ainda é representante de alguma filial
        const aindaRepFilial = await this.usuarioFilialRepository.userHasAnyFilialRepresentante(idUsuario)
        console.log(aindaRepFilial)
        if (!aindaRepFilial) {
            await this.repository.removeUserPermissions(idUsuario, [1, 4])
        }
    }
    
    /**
     * Adiciona permissões obrigatórias ao usuário caso não existam
     */
    async _handleAdicaoPermissoes(idUsuario, uid) {
        if (!uid) {
            throw new Error('UID do usuário não encontrado para inserir permissões')
        }
    
        const currentPerms = await this.usuarioRepository.getUserPermissions(uid)
        const currentIds = Array.isArray(currentPerms)
            ? currentPerms.map(p => p.id_permissao).filter(Boolean)
            : []
    
        const requiredIds = [1, 4, 6]
        const missingIds = requiredIds.filter(id => !currentIds.includes(id))
    
        if (missingIds.length > 0) {
            await this.repository.addUserPermissions(idUsuario, uid, missingIds)
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