'use strict'

const TokenService = use('App/Services/tokens/TokenService')
const TokenStore = use('App/Services/tokens/TokenStore')

class EnsureJwt {
  async handle({ request, response }, next) {
    const authHeader = request.header('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    if (!token) {
      return response.status(401).json({ success: false, message: 'Token não fornecido' })
    }

    try {
      // Check token exists in local store
      if (!TokenStore.has(token)) {
        return response.status(401).json({ success: false, message: 'Token inválido ou expirado' })
      }

      // Verify signature and expiration
      const decodedToken = TokenService.verifyToken(token)
      
      // Add user data to request context
      request.user = decodedToken
    } catch (error) {
      return response.status(401).json({ success: false, message: error.message || 'Token inválido' })
    }

    await next()
  }
}

module.exports = EnsureJwt


