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
     * Busca um usuário específico
     */
    async showUid({ params, response }) {
        try {
            const usuario = await this.service.getUsuarioByUid(params.uid)
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
            const usuarioData = request.only(['nome_completo', 'email', 'telefone', 'cargo', 'id_filial', 'id_departamento'])
            const usuario = await this.service.updateUsuario(params.id, usuarioData)
            return response.status(200).json(usuario)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Altera o status do usuário
     */
    async changeStatus({ params, request, response }) {
        try {
            const statusData = request.only('status')
            
            if (statusData.status === undefined || statusData.status === null) {
                return response.status(400).json({ error: 'Status é obrigatório' })
            }

            // Converte o status para boolean se for string
            let statusValue = statusData.status
            if (typeof statusValue === 'string') {
                if (statusValue.toLowerCase() === 'true') {
                    statusValue = true
                } else if (statusValue.toLowerCase() === 'false') {
                    statusValue = false
                } else {
                    return response.status(400).json({ error: 'Status deve ser um valor booleano (true/false)' })
                }
            } else if (typeof statusValue !== 'boolean') {
                return response.status(400).json({ error: 'Status deve ser um valor booleano (true/false)' })
            }

            const usuario = await this.service.getUsuarioById(params.id)

            if (!usuario) {
                return response.status(404).json({ error: 'Usuário não encontrado' })
            }

            const usuarioAtualizado = await this.service.changeStatus(params.id, statusValue)
            return response.status(200).json(usuarioAtualizado)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * Inativa um usuário
     */
    async destroy({ params, request, response }) {
        try {
            const statusData = request.only('status')
            
            if (statusData.status === undefined || statusData.status === null) {
                return response.status(400).json({ error: 'Status é obrigatório' })
            }

            // Converte o status para boolean se for string
            let statusValue = statusData.status
            if (typeof statusValue === 'string') {
                if (statusValue.toLowerCase() === 'true') {
                    statusValue = true
                } else if (statusValue.toLowerCase() === 'false') {
                    statusValue = false
                } else {
                    return response.status(400).json({ error: 'Status deve ser um valor booleano (true/false)' })
                }
            } else if (typeof statusValue !== 'boolean') {
                return response.status(400).json({ error: 'Status deve ser um valor booleano (true/false)' })
            }

            const usuarioAtualizado = await this.service.inactivateUsuario(params.id, statusValue)
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