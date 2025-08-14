'use strict'

const { AuthService } = require('../../../Services/AuthService')
const TokenService = require('../../../Services/tokens/TokenService')

class AuthController {
  constructor() {
    this.authService = new AuthService()
  }

  /**
   * Login user
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async login({ request, response }) {
    try {
      const { email, password } = request.all()
      
      // Validate required fields
      if (!email || !password) {
        return response.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        })
      }

      const result = await this.authService.login(email, password)
      
      return response.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Login error in controller:', error)
      return response.status(500).json({
        success: false,
        message: error.message || 'Erro ao realizar login'
      })
    }
  }

  /**
   * Logout user
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async logout({ request, response }) {
    try {
      const token = request.header('Authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return response.status(401).json({
          success: false,
          message: 'Token não fornecido'
        })
      }

      const result = await this.authService.logout(token)
      
      return response.json({
        success: true,
        message: 'Logout realizado com sucesso'
      })
    } catch (error) {
      console.error('Logout error in controller:', error)
      return response.status(500).json({
        success: false,
        message: error.message || 'Erro ao realizar logout'
      })
    }
  }

  /**
   * Refresh token
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async refresh({ request, response }) {
    try {
      const { refresh_token } = request.all()
      
      if (!refresh_token) {
        return response.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório'
        })
      }

      const newToken = TokenService.refreshTokenIfNeeded(refresh_token)
      
      if (!newToken) {
        return response.status(401).json({
          success: false,
          message: 'Token inválido ou não precisa ser atualizado'
        })
      }

      return response.json({
        success: true,
        data: newToken
      })
    } catch (error) {
      console.error('Refresh error in controller:', error)
      return response.status(500).json({
        success: false,
        message: error.message || 'Erro ao atualizar token'
      })
    }
  }

  /**
   * Forgot password
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async forgotPassword({ request, response }) {
    try {
      const { email } = request.all()

      if (!email) {
        return response.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        })
      }

      const result = await this.authService.forgotPassword(email)
      
      return response.json({
        success: true,
        message: result,//'Se o email existir em nossa base, você receberá as instruções para redefinir sua senha'
      })
    } catch (error) {
      console.error('Forgot password error in controller:', error)
      return response.status(500).json({
        success: false,
        message: error.message || 'Erro ao processar solicitação de redefinição de senha'
      })
    }
  }

  /**
   * Validate reset password token
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async validateResetToken({ request, response }) {
    try {
      const { token } = request.all()

      if (!token) {
        return response.status(400).json({
          success: false,
          message: 'Token é obrigatório'
        })
      }

      const result = await this.authService.validateResetToken(token)
      
      return response.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Validate reset token error in controller:', error)
      return response.status(400).json({
        success: false,
        message: error.message || 'Token inválido ou expirado'
      })
    }
  }

  /**
   * Validate reset password token and code
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async validateResetCode({ request, response }) {
    try {
      const { token, code } = request.all()

      if (!token || !code) {
        return response.status(400).json({
          success: false,
          message: 'Token e código são obrigatórios'
        })
      }

      const result = await this.authService.validateResetCode(token, code)
      
      return response.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Validate reset code error in controller:', error)
      return response.status(400).json({
        success: false,
        message: error.message || 'Token ou código inválidos'
      })
    }
  }

  /**
   * Reset user password
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async resetPassword({ request, response }) {
    try {
      const { token, uid, code, new_password } = request.all()

      if (!token || !uid || !code || !new_password) {
        return response.status(400).json({
          success: false,
          message: 'Token, uid, código e nova senha são obrigatórios'
        })
      }

      const result = await this.authService.resetPassword(token, uid, code, new_password)
      
      return response.json({
        success: true,
        message: 'Senha atualizada com sucesso'
      })
    } catch (error) {
      console.error('Reset password error in controller:', error)
      return response.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar senha'
      })
    }
  }

  /**
   * Define user password
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async definePassword({ request, response }) {
    try {
      const { token, uid, code, password, new_password } = request.all()

      if (!token || !uid || !code || !password || !new_password) {
        return response.status(400).json({
          success: false,
          message: 'Token, uid, código, senha atual e nova senha são obrigatórios'
        })
      }

      const result = await this.authService.definePassword(token, uid, code, password, new_password)
      
      return response.json({
        success: true,
        message: 'Senha definida com sucesso'
      })
    } catch (error) {
      console.error('Define password error in controller:', error)
      return response.status(400).json({
        success: false,
        message: error.message || 'Erro ao definir senha'
      })
    }
  }

  /**
   * Active user (create new user in authentication system)
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async activeUser({ request, response }) {
    try {
      const { email, password } = request.all()
      
      // Validate required fields
      if (!email || !password) {
        return response.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        })
      }

      const result = await this.authService.activeUser(email, password)
      
      return response.json({
        success: true,
        message: result.message,
        data: result.user
      })
    } catch (error) {
      console.error('Active user error in controller:', error)
      
      // Tratamento específico de erros
      if (error.message.includes('já existe')) {
        return response.status(409).json({
          success: false,
          message: error.message
        })
      }
      
      if (error.message.includes('Formato de email inválido')) {
        return response.status(400).json({
          success: false,
          message: error.message
        })
      }
      
      if (error.message.includes('senha deve ter pelo menos 8 caracteres')) {
        return response.status(400).json({
          success: false,
          message: error.message
        })
      }
      
      return response.status(500).json({
        success: false,
        message: error.message || 'Erro ao criar usuário'
      })
    }
  }

  /**
   * Verify access code for client activation
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async verifyAccessCode({ request, response }) {
    try {
      const { code } = request.all()

      if (!code) {
        return response.status(400).json({
          success: false,
          message: 'Código são obrigatórios'
        })
      }

      const result = await this.authService.verifyAccessCode(code)
      
      return response.json({
        success: true,
        message: result.message,
        data: result.user
      })
    } catch (error) {
      console.error('Verify access code error in controller:', error)
      return response.status(400).json({
        success: false,
        message: error.message || 'Código inválidos'
      })
    }
  }
}

module.exports = AuthController
