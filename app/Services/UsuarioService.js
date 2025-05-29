'use strict'

const UsuarioRepository = require('../Repositories/UsuarioRepository')
const AuthService = require('./AuthService')
const PasswordGenerator = require('../Utils/PasswordGenerator')
const SendEmail = require('../Services/Emails/SendEmail')

/**
 * Serviço responsável pela lógica de negócios relacionada aos usuários
 */
class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository()
    }

    /**
     * Retorna todos os usuários ativos
     * @returns {Promise<Array>} Lista de usuários
     * @throws {Error} Erro ao buscar usuários
     */
    async getAllUsuarios() {
        try {
            return await this.repository.getAllUsuarios()
        } catch (error) {
            throw new Error(`Erro ao buscar usuários: ${error.message}`)
        }
    }

    /**
     * Busca um usuário pelo ID
     * @param {number} id - ID do usuário
     * @returns {Promise<Object>} Dados do usuário
     * @throws {Error} Erro ao buscar usuário ou usuário não encontrado
     */
    async getUsuarioById(id) {
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }

        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }
            return usuario
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`)
        }
    }

    /**
     * Busca um usuário pelo email
     * @param {string} email - Email do usuário
     * @returns {Promise<Object>} Dados do usuário
     * @throws {Error} Erro ao buscar usuário ou usuário não encontrado
     */
    async getUsuarioByEmail(email) {
        if (!email) {
            throw new Error('Email do usuário é obrigatório')
        }

        try {
            const usuario = await this.repository.getUsuarioByEmail(email)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }
            return usuario
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`)
        }
    }

    /**
     * Cria um novo usuário
     * @param {Object} usuarioData - Dados do usuário
     * @param {string} usuarioData.nome_completo - Nome completo do usuário
     * @param {string} usuarioData.email - Email do usuário
     * @param {string} usuarioData.telefone - Telefone do usuário
     * @param {string} usuarioData.cargo - Cargo do usuário
     * @returns {Promise<Object>} Dados do usuário criado
     * @throws {Error} Erro ao criar usuário ou dados inválidos
     */
    async createUsuario(usuarioData) {
        const { nome_completo, email, telefone, cargo } = usuarioData

        console.log('Iniciando criação de usuário:', { nome_completo, email, telefone, cargo })

        if (!nome_completo || !email || !telefone || !cargo) {
            throw new Error('Todos os campos são obrigatórios')
        }

        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw new Error('Email inválido')
        }

        // Validação básica de telefone (aceita apenas números)
        const telefoneRegex = /^\d+$/
        if (!telefoneRegex.test(telefone)) {
            throw new Error('Telefone deve conter apenas números')
        }

        try {
            // Verifica se já existe um usuário com o mesmo email
            console.log('Verificando email existente:', email)
            const usuarioExistente = await this.repository.getUsuarioByEmail(email)
            if (usuarioExistente) {
                throw new Error('Já existe um usuário com este email')
            }

            // Gera uma senha aleatória
            console.log('Gerando senha aleatória')
            const password = PasswordGenerator.generatePassword()
            
            // Cria o usuário no sistema de autenticação
            console.log('Criando usuário no sistema de autenticação')
            const authUser = await AuthService.signUp(email, password)
            console.log('Resposta do AuthService:', authUser)

            if (!authUser || !authUser.user || !authUser.user.id) {
                throw new Error('Erro ao criar usuário no sistema de autenticação')
            }

            // Cria o usuário no banco de dados
            console.log('Criando usuário no banco de dados')
            const { data: usuario, error: userErr } = await this.repository.createUsuario({
                nome_completo,
                email,
                telefone,
                cargo,
                uid: authUser.user.id
            })

            if (userErr) {
                console.error('Erro ao criar usuário no banco:', userErr)
                throw new Error(`Erro ao criar usuário no banco de dados: ${userErr.message}`)
            }

            if (!usuario) {
                console.error('Dados do usuário não retornados')
                throw new Error('Erro ao criar usuário: Dados não retornados')
            }

            try {
                // Envia email de boas-vindas com a senha
                console.log('Enviando email de boas-vindas')
                await SendEmail.sendWelcomeEmail(email, nome_completo, password)
            } catch (emailError) {
                console.error('Erro ao enviar email de boas-vindas:', emailError)
                // Não interrompe o fluxo se o email falhar
            }

            console.log('Usuário criado com sucesso:', usuario)
            return usuario
        } catch (error) {
            console.error('Erro na criação do usuário:', error)
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }

    /**
     * Atualiza um usuário existente
     * @param {number} id - ID do usuário
     * @param {Object} usuarioData - Dados do usuário para atualização
     * @param {string} [usuarioData.nome_completo] - Nome completo do usuário
     * @param {string} [usuarioData.email] - Email do usuário
     * @param {string} [usuarioData.telefone] - Telefone do usuário
     * @param {string} [usuarioData.cargo] - Cargo do usuário
     * @returns {Promise<Object>} Dados do usuário atualizado
     * @throws {Error} Erro ao atualizar usuário ou dados inválidos
     */
    async updateUsuario(id, usuarioData) {
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }

        const { nome_completo, email, telefone, cargo } = usuarioData

        if (!nome_completo && !email && !telefone && !cargo) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        // Validação de email se fornecido
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                throw new Error('Email inválido')
            }
        }

        // Validação de telefone se fornecido
        if (telefone) {
            const telefoneRegex = /^\d+$/
            if (!telefoneRegex.test(telefone)) {
                throw new Error('Telefone deve conter apenas números')
            }
        }

        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            // Se estiver atualizando o email, verifica se já existe outro usuário com o mesmo email
            if (email && email !== usuario.email) {
                const usuarioExistente = await this.repository.getUsuarioByEmail(email)
                if (usuarioExistente) {
                    throw new Error('Já existe um usuário com este email')
                }
            }

            return await this.repository.updateUsuario(id, usuarioData)
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário: ${error.message}`)
        }
    }

    /**
     * Inativa um usuário
     * @param {number} id - ID do usuário
     * @returns {Promise<Object>} Dados do usuário inativado
     * @throws {Error} Erro ao inativar usuário ou usuário não encontrado
     */
    async inactivateUsuario(id) {
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }

        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            return await this.repository.inactivateUsuario(id)
        } catch (error) {
            throw new Error(`Erro ao inativar usuário: ${error.message}`)
        }
    }
}

module.exports = UsuarioService 