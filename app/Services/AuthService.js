'use strict'

const { AuthRepository } = require('../Repositories/AuthRepository')
const TokenService = require('./tokens/TokenService')

class AuthService {
    constructor() {
        this.repository = new AuthRepository()
    }

    /**
     * Authenticate user and return user data with token
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with token
     */
    async login(email, password) {
        try {
            // Authenticate with Supabase
            const authData = await this.repository.authenticateUser(email, password)
            
            // Get user data
            const usuario = await this.repository.getUserData(authData.user.id)
            
            // Get user permissions
            const userPerm = await this.repository.getUserPermissions(authData.user.id)

            // Format filiais data
            const filiaisFormatadas = this.formatFiliaisData(usuario.filiais)

            // Generate token
            const tokenData = this.prepareTokenData(usuario, userPerm)
            const tokenInfo = TokenService.createToken(tokenData)

            // Prepare and return response
            return this.prepareLoginResponse(usuario, userPerm, filiaisFormatadas, tokenInfo, authData)
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    /**
     * Cria um novo usuário no sistema de autenticação
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Dados do usuário criado
     * @throws {Error} Erro ao criar usuário
     */
    async signUp(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email e senha são obrigatórios')
            }

            const auth = await this.repository.signUp(email, password)

            if (!auth || !auth.user) {
                throw new Error('Erro ao criar usuário no sistema de autenticação')
            }

            return auth
        } catch (error) {
            console.error('AuthService: Erro no signUp:', error)
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }

    /**
     * Format filiais data
     * @param {Array} filiais - Raw filiais data
     * @returns {Array} Formatted filiais data
     */
    formatFiliaisData(filiais) {
        return filiais.map(filial => ({
            cnpj: filial.filial.cnpj,
            endereco: filial.filial.endereco,
            nome_filial: filial.filial.nome_filial,
            is_representante: filial.is_representante,
            departamentos: filial.filial.departamentos.map(d => d.nome_departamento) || []
        }))
    }

    /**
     * Prepare token data
     * @param {Object} usuario - User data
     * @param {Array} userPerm - User permissions
     * @returns {Object} Token data
     */
    prepareTokenData(usuario, userPerm) {
        return {
            uid: usuario.uid,
            email: usuario.email,
            nome: usuario.nome_completo,
            permissoes: userPerm.map(p => p.permissoes.tag)
        }
    }

    /**
     * Prepare login response
     * @param {Object} usuario - User data
     * @param {Array} userPerm - User permissions
     * @param {Array} filiaisFormatadas - Formatted filiais data
     * @param {Object} tokenInfo - Token information
     * @param {Object} authData - Authentication data
     * @returns {Object} Formatted response
     */
    prepareLoginResponse(usuario, userPerm, filiaisFormatadas, tokenInfo, authData) {
        return {
            user: {
                nome: usuario.nome_completo,
                email: usuario.email,
                telefone: usuario.telefone,
                cargo: usuario.cargo,
                filiais: filiaisFormatadas,
                permissoes: userPerm.map(p => p.permissoes.tag),
                uid: usuario.uid,
                status: usuario.status
            },
            token: tokenInfo.token,
            expiresAt: tokenInfo.expiresAt,
            needsRefresh: tokenInfo.needsRefresh,
            session: {
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token
            }
        }
    }

    /**
     * Logout user
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Logout result
     */
    async logout(token) {
        try {
            // Validate token
            const decodedToken = TokenService.verifyToken(token)
            if (!decodedToken) {
                throw new Error('Token inválido')
            }

            // Perform logout
            await this.repository.signOut()

            return {
                success: true,
                message: 'Logout realizado com sucesso',
                userId: decodedToken.uid
            }
        } catch (error) {
            console.error('Logout error:', error)
            throw new Error(error.message || 'Erro ao realizar logout')
        }
    }
}

module.exports = { AuthService }