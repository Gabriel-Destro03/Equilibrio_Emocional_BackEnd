const jwt = require('jsonwebtoken')
const Config = use('Config')

class TokenService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-secret-key'
    this.defaultExpiration = '2h' // Default expiration time
    this.refreshThreshold = 5 * 60 // 5 minutes in seconds
  }

  /**
   * Generate a JWT token with the provided data and optional expiration time
   * @param {Object} data - Data to be encoded in the token
   * @param {string} [expiration] - Optional expiration time (default: 2h)
   * @returns {string} JWT token
   */
  generateToken(data, expiration = this.defaultExpiration) {
    try {
      const token = jwt.sign(data, this.secretKey, {
        expiresIn: expiration
      })
      return token
    } catch (error) {
      console.error('Error generating token:', error)
      throw new Error('Failed to generate token')
    }
  }

  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token data
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secretKey)
      return decoded
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired')
      }
      throw new Error('Invalid token')
    }
  }

  /**
   * Check if token needs to be refreshed (within 5 minutes of expiration)
   * @param {string} token - JWT token to check
   * @returns {boolean} True if token needs refresh
   */
  needsRefresh(token) {
    try {
      const decoded = jwt.decode(token)
      if (!decoded || !decoded.exp) return true

      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = decoded.exp - currentTime

      return timeUntilExpiry <= this.refreshThreshold
    } catch (error) {
      return true
    }
  }

  /**
   * Refresh token if it's close to expiring
   * @param {string} token - Current JWT token
   * @param {Object} [additionalData] - Additional data to include in new token
   * @returns {Object|null} New token info if refreshed, null if not needed
   */
  refreshTokenIfNeeded(token, additionalData = {}) {
    if (!this.needsRefresh(token)) {
      return null
    }

    try {
      const decoded = jwt.decode(token)
      const newData = {
        ...decoded,
        ...additionalData
      }
      // Remove JWT specific fields
      delete newData.iat
      delete newData.exp

      return this.createToken(newData)
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw new Error('Failed to refresh token')
    }
  }

  /**
   * Generate a token with specific data and expiration time
   * @param {Object} data - Data to be encoded in the token
   * @param {string} [expiration] - Optional expiration time (default: 2h)
   * @returns {Object} Token information including the token and expiration
   */
  createToken(data, expiration = this.defaultExpiration) {
    const token = this.generateToken(data, expiration)
    const decoded = this.verifyToken(token)
    
    return {
      token,
      expiresAt: decoded.exp,
      data: decoded,
      needsRefresh: this.needsRefresh(token)
    }
  }
}

module.exports = new TokenService() 