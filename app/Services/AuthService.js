'use strict'

const { AuthRepository } = require('../Repositories/AuthRepository')
const UsuarioRepository = require('../Repositories/UsuarioRepository')
const TokenService = require('./tokens/TokenService')
const UserRepository = require('../Repositories/UserRepository')
const SendEmail = require('./Emails/SendEmail')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

class AuthService {
    constructor() {
        this.repository = new AuthRepository()
        this.userRepository = new UserRepository()
        this.usuarioRepository = new UsuarioRepository()
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

            // Authenticate with Supabase
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
     * Cria um novo usuário no sistema de autenticação
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Dados do usuário criado
     * @throws {Error} Erro ao criar usuário
     */
    async activeUser(email, password) {
        try {
            
            if (!email || !password) {
                throw new Error('Email e senha são obrigatórios')
            }

            // Validar formato do email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                throw new Error('Formato de email inválido')
            }

            // Validar força da senha
            if (password.length < 8) {
                throw new Error('A senha deve ter pelo menos 8 caracteres')
            }

            // Verificar se o usuário já existe na tabela de usuários
            let existingUser = null
            try {
                existingUser = await this.userRepository.findByEmail(email)
            } catch (error) {
                // Se o erro for "não encontrado", continuar
                if (!error.message.includes('não encontrado') && !error.message.includes('not found') && !error.message.includes('já existe')) {
                    throw error
                }
                // Se o erro for "já existe", propagar
                if (error.message.includes('já existe')) {
                    throw error
                }
            }

            // Verificar se o usuário já existe no sistema de autenticação (Supabase Auth)
            try {
                const supabaseAdmin = createClient(
                    process.env.VITE_SUPABASE_URL,
                    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
                )

                // Buscar usuário por email no sistema de autenticação
                const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
                
                if (authError) {
                    console.error('Erro ao listar usuários:', authError)
                    throw new Error('Erro ao verificar usuário no sistema de autenticação')
                }

                // Verificar se existe um usuário com o email fornecido
                const existingAuthUser = authUsers.users.find(user => user.email === email)
                
                if (existingAuthUser) {
                    throw new Error('Usuário já existe no sistema de autenticação')
                }
            } catch (error) {
                // Se o erro for específico sobre usuário já existir, propagar
                if (error.message.includes('já existe')) {
                    throw error
                }
                // Para outros erros, continuar (pode ser erro de conexão, etc.)
                console.error('Erro ao verificar usuário no auth:', error)
            }

            // Criar usuário no sistema de autenticação
            const auth = await this.repository.signUp(email, password)

            if (!auth || !auth.user) {
                throw new Error('Erro ao criar usuário no sistema de autenticação')
            }

            // Se o usuário existir na tabela, atualizar o UID
            if (existingUser) {
                await this.usuarioRepository.updateUsuarioUId(existingUser.id, auth.user.id)
            }

            return {
                success: true,
                message: 'Usuário criado com sucesso',
                user: auth.user
            }
        } catch (error) {
            console.error('AuthService: Erro no activeUser:', error)
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }

    /**
     * Format filiais data
     * @param {Array} filiais - Raw filiais data
     * @returns {Array} Formatted filiais data
     */
    formatFiliaisData(filiais) {

        //return filiais;

        return filiais.map(filial => ({
            idFilial: filial.filial.id,
            cnpj: filial.filial.cnpj,
            endereco: filial.filial.endereco,
            nome_filial: filial.filial.nome_filial,
            is_representante: filial.is_representante,
            departamentos: filial.filial.departamentos.map(d => ({
                id: d.id,
                id_filial: d.id_filial,
                nome: d.nome_departamento
            })) || []
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
                empresa_id: usuario.empresa_id,
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

    /**
     * Process forgot password request
     * @param {string} email User's email
     * @returns {Promise<Object>} Result of the operation
     */
    async forgotPassword(email) {
        try {
            
            const user = await this.userRepository.findByEmail(email)
            if (!user) {
                return { success: false, message: 'Usuário não encontrado' }
            }

            // Gerar código único para reset de senha
            const resetCode = crypto.randomBytes(4).toString('hex').toUpperCase()
            
            const body = {
                uid: user.uid,
                type: "reset_password",
                code: resetCode,
                status: true,
                expira_em: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
            }

            // Gerar token com os dados do body
            body.token = TokenService.createToken(body).token
            const resetLink = `${process.env.VITE_URL_FRONT}/codigo?token=${body.token}`

            // Salvar na tabela acoes_usuarios
            await this.userRepository.saveUserAction({
                uid: user.uid,
                type: 'reset_password',
                code: resetCode,
                status: true,
                expira_em: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
                token: body.token
            })

            // Enviar email
            const sendemail = await SendEmail.sendResetPasswordEmail(
                user.email,
                user.nome_completo,
                resetCode,
                resetLink
            )
            return sendemail
            return { success: true }
        } catch (error) {
            console.error('Error in forgotPassword service:', error)
            throw new Error('Erro ao processar solicitação de redefinição de senha')
        }
    }

    /**
     * Validate reset password token
     * @param {string} token Token to validate
     * @returns {Promise<Object>} Token validation result
     */
    async validateResetToken(token) {
        try {
            // Buscar ação do usuário pelo token
            const action = await this.userRepository.findActionByToken(token)
            
            if (!action) {
                throw new Error('Token inválido')
            }

            // Verificar se o token está expirado
            const now = new Date()
            const expiraEm = new Date(action.expira_em)
            
            if (now > expiraEm) {
                throw new Error('Token expirado')
            }

            // Verificar se o status está ativo
            if (!action.status) {
                throw new Error('Token inválido')
            }

            return action
        } catch (error) {
            console.error('Error validating reset token:', error)
            throw error
        }
    }

    /**
     * Validate reset password token and code
     * @param {string} token Token to validate
     * @param {string} code Code to validate
     * @returns {Promise<Object>} Validation result
     */
    async validateResetCode(token, code) {
        try {
            // Buscar ação do usuário pelo token e código
            const action = await this.userRepository.findActionByTokenAndCode(token, code)
            
            if (!action) {
                throw new Error('Token ou código inválidos')
            }

            // Verificar se o token está expirado
            const now = new Date()
            const expiraEm = new Date(action.expira_em)
            
            if (now > expiraEm) {
                throw new Error('Token expirado')
            }

            // Verificar se o status está ativo
            if (!action.status) {
                throw new Error('Token inválido')
            }

            return {
                valid: true,
                action
            }
        } catch (error) {
            console.error('Error validating reset code:', error)
            throw error
        }
    }

    /**
     * Reset user password
     * @param {string} token Token to validate
     * @param {string} uid User ID
     * @param {string} code Code to validate
     * @param {string} newPassword New password
     * @returns {Promise<Object>} Reset result
     */
    async resetPassword(token, uid, code, newPassword) {
        try {
            // Validar dados de entrada
            if (!token || !uid || !code || !newPassword) {
                throw new Error('Todos os campos são obrigatórios')
            }

            // Buscar ação do usuário pelo token, uid e código
            const action = await this.userRepository.findActionByTokenUidAndCode(token, uid, code)
            
            if (!action) {
                throw new Error('Token, uid ou código inválidos')
            }

            // Verificar se o token está expirado
            const now = new Date()
            const expiraEm = new Date(action.expira_em)
            
            if (now > expiraEm) {
                throw new Error('Token expirado')
            }

            // Verificar se o status está ativo
            if (!action.status) {
                throw new Error('Token já utilizado')
            }

            // Atualizar a senha usando o AuthRepository
            await this.repository.resetSenha(uid, newPassword)

            // Atualizar o status da ação para usado
            await this.userRepository.updateActionStatus(action.id, false)

            return { 
                success: true,
                message: 'Senha atualizada com sucesso'
            }
        } catch (error) {
            console.error('Error resetting password:', error)
            
            // Tratamento específico de erros
            if (error.message.includes('password')) {
                throw new Error('A senha não atende aos requisitos mínimos de segurança')
            }
            
            if (error.message.includes('network')) {
                throw new Error('Erro de conexão. Tente novamente mais tarde')
            }

            throw new Error(error.message || 'Erro ao atualizar senha')
        }
    }

    /**
     * Define user password
     * @param {string} token Token to validate
     * @param {string} uid User ID
     * @param {string} code Code to validate
     * @param {string} currentPassword Current password
     * @param {string} newPassword New password
     * @returns {Promise<Object>} Define password result
     */
    async definePassword(token, uid, code, currentPassword, newPassword) {
        try {
            // Validar dados de entrada
            if (!token || !uid || !code || !currentPassword || !newPassword) {
                throw new Error('Todos os campos são obrigatórios')
            }

            // Buscar ação do usuário pelo token, uid e código
            const action = await this.userRepository.findActionByTokenUidAndCode(token, uid, code)
            
            if (!action) {
                throw new Error('Token, uid ou código inválidos')
            }

            // Verificar se o token está expirado
            const now = new Date()
            const expiraEm = new Date(action.expira_em)
            
            if (now > expiraEm) {
                throw new Error('Token expirado')
            }

            // Verificar se o status está ativo
            if (!action.status) {
                throw new Error('Token já utilizado')
            }

            // Verificar se a senha atual está correta
            const user = await this.usuarioRepository.getUsuarioByUid(uid)
            
            if (!user) {
                throw new Error('Usuário não encontrado')
            }

            if(currentPassword !== newPassword){
                throw new Error('As senhas não coincidem')
            }

            // Criar novo usuário no sistema de autenticação
            const userAuth = await this.signUp(user.email, currentPassword)
            
            if (!userAuth || !userAuth.user || !userAuth.user.id) {
                throw new Error('Erro ao criar usuário no sistema de autenticação')
            }

            // Atualizar o UID do usuário na tabela de usuários
            await this.usuarioRepository.updateUsuarioUId(user.id, userAuth.user.id)

            // Atualizar o status da ação para usado
            await this.userRepository.updateActionStatus(action.id, false)

            return { 
                success: true,
                message: 'Senha definida com sucesso'
            }
        } catch (error) {
            console.error('Error defining password:', error)
            console.error('Error stack:', error.stack)
            
            // Tratamento específico de erros
            if (error.message.includes('password')) {
                throw new Error('A senha não atende aos requisitos mínimos de segurança')
            }
            
            if (error.message.includes('network')) {
                throw new Error('Erro de conexão. Tente novamente mais tarde')
            }

            throw new Error(error.message || 'Erro ao definir senha')
        }
    }
}

module.exports = { AuthService }