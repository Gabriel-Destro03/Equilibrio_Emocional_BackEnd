const { SupabaseAuthRepository } = require('../Repositories/SupabaseAuthRepository')

class SupabaseAuthService {
  constructor() {
    this.repository = new SupabaseAuthRepository()
  }

  async getAllUsers() {
    try {
      const users = await this.repository.getUsers()
      return users
    } catch (error) {
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