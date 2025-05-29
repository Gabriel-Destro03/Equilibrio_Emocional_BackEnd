'use strict'

const Config = use('Config')
const TokenService = require('../Services/tokens/TokenService')

class AuthRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
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

            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`
                }
            })

            if (error) {
                console.error('AuthRepository: Erro do Supabase:', error)
                throw new Error(error.message || 'Erro ao cadastrar usuário')
            }

            if (!data || !data.user) {
                throw new Error('Dados do usuário não retornados pelo Supabase')
            }

            return data
        } catch (error) {
            console.error('AuthRepository: Erro no signUp:', error)
            throw new Error(error.message || 'Erro ao cadastrar usuário')
        }
    }

    /**
     * Authenticate user with Supabase
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Authentication data
     */
    async authenticateUser(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error || !data.user) {
            throw new Error('E-mail ou senha inválidos!')
        }

        return data
    }

    /**
     * Get user data with related information
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User data
     */
    async getUserData(userId) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select(`
                *,
                departamentos:usuario_departamento(
                    id_departamento,
                    is_representante,
                    departamento:departamentos(*)
                ),
                filiais:usuario_filial(
                    id_filial,
                    is_representante,
                    filial:filiais(
                        cnpj,
                        endereco,
                        nome_filial,
                        departamentos:departamentos(*)
                    )
                )
            `)
            .eq('uid', userId)
            .single()

        if (error) {
            throw new Error('Erro ao buscar dados do usuário')
        }

        if (!data.status) {
            throw new Error('Usuário Inativo. Contate um administrador!')
        }

        return data
    }

    /**
     * Get user permissions
     * @param {string} userId - User ID
     * @returns {Promise<Array>} User permissions
     */
    async getUserPermissions(userId) {
        const { data, error } = await this.supabase
            .from('usuario_permissoes')
            .select(`
                *,
                permissoes:permissoes(*)
            `)
            .eq('uid', userId)

        if (error) {
            throw new Error('Erro ao buscar permissões do usuário')
        }

        return data
    }

    /**
     * Sign out from Supabase
     * @returns {Promise<void>}
     */
    async signOut() {
        const { error } = await this.supabase.auth.signOut()
        if (error) {
            throw new Error('Erro ao fazer logout: ' + error.message)
        }
    }

    /**
     * Logout user and close Supabase session
     * @param {string} token - JWT token to validate
     * @returns {Promise<Object>} Logout result
     */
    async logout(token) {
        try {
            // Validate token first
            const decodedToken = TokenService.verifyToken(token)
            if (!decodedToken) {
                throw new Error('Token inválido')
            }

            // Sign out from Supabase
            await this.signOut()

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

module.exports = { AuthRepository }