const Config = use('Config')

class SupabaseAuthRepository {
  constructor() {
    this.supabase = Config.get('supabase').client
  }

  async getUsers() {
    try {
      const { data: users, error } = await this.supabase.from('usuarios')
      .select('*')
      
      if (error) {
        throw new Error(error.message)
      }

      return users
    } catch (error) {
      throw error
    }
  }

  async getUserById(userId) {
    try {
      const { data: user, error } = await this.supabase.auth.admin.getUserById(userId)
      
      if (error) {
        throw new Error(error.message)
      }

      return user
    } catch (error) {
      throw error
    }
  }
}

module.exports = { SupabaseAuthRepository } 