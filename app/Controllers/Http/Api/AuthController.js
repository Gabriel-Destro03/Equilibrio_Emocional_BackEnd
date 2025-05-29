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
}

module.exports = AuthController
