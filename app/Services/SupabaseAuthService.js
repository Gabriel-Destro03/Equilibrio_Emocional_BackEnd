const { SupabaseAuthRepository } = require('../Repositories/SupabaseAuthRepository')
const SendEmail = require('./Emails/SendEmail')

class SupabaseAuthService {
  constructor() {
    this.repository = new SupabaseAuthRepository()
  }

  async getAllUsers() {
    try {
      const users = await this.repository.getUsers()

      var result = await SendEmail.sendWelcomeEmail('gdestro@3xsolutions.com.br', 'Gabriel', '12345678');
      console.log(result)
      return users
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getUserById(userId) {
    try {
      const user = await this.repository.getUserById(userId)
      return user
    } catch (error) {
      throw error
    }
  }
}

module.exports = { SupabaseAuthService } 