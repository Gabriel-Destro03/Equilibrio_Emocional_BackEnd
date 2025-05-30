'use strict'

const UsuarioService = require('../../../Services/UsuarioService')

class UsuarioController {
    constructor() {
        this.service = new UsuarioService()
    }

    /**
     * Lista todos os usuários ativos
     */
    async index({ response }) {
        try {
            const usuarios = await this.service.getAllUsuarios()
            return response.status(200).json(usuarios)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca um usuário específico
     */
    async show({ params, response }) {
        try {
            const usuario = await this.service.getUsuarioById(params.id)
            return response.status(200).json(usuario)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Busca um usuário por email
     */
    async getByEmail({ params, response }) {
        try {
            const usuario = await this.service.getUsuarioByEmail(params.email)
            return response.status(200).json(usuario)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Cria um novo usuário
     */
    async store({ request, response }) {
        try {
            
            const usuarioData = request.only(['nome_completo', 'email', 'telefone', 'cargo', 'id_filial', 'id_departamento'])
            
            const usuario = await this.service.createUsuario(usuarioData)
            return response.status(201).json(usuario)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Atualiza um usuário existente
     */
    async update({ params, request, response }) {
        try {
            const usuarioData = request.only(['nome_completo', 'email', 'telefone', 'cargo'])
            const usuario = await this.service.updateUsuario(params.id, usuarioData)
            return response.status(200).json(usuario)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Altera o status do usuário
     */
    async changeStatus({ params, response }) {
        try {
            const usuario = await this.service.getUsuarioById(params.id)

            if (!usuario) {
                return response.status(404).json({ error: 'Usuário não encontrado' })
            }

            const usuarioAtualizado = await this.service.changeStatus(params.id)
            return response.status(200).json(usuarioAtualizado)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Inativa um usuário
     */
    async destroy({ params, response }) {
        try {
            const usuarioAtualizado = await this.service.inactivateUsuario(params.id)
            return response.status(200).json(usuarioAtualizado)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Lista todos os usuários das filiais que o usuário tem acesso
     */
    async getUsuariosByFilial({ params, response }) {
        try {
            const usuarios = await this.service.getUsuariosByFilial(params.uid)
            return response.status(200).json(usuarios)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = UsuarioController 