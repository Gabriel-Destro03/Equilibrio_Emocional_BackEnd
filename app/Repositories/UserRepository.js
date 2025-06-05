'use strict'

const Config = use('Config')

class UserRepository {
  constructor() {
    this.supabase = Config.get('supabase').client
  }

  async findByEmail(email) {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('uid, email, nome_completo')
        .eq('email', email)
        .single()

      if (error) throw new Error(error.message)
      return data
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw new Error('Erro ao buscar usuário por email')
    }
  }

  /**
   * Save user action in acoes_usuarios table
   * @param {Object} actionData Action data to save
   * @param {number} actionData.user_id User ID
   * @param {string} actionData.tipo_acao Action type
   * @param {string} actionData.codigo Action code
   * @param {string} actionData.status Action status
   * @param {Date} actionData.expira_em Expiration date
   * @returns {Promise<Object>} Saved action data
   */
  async saveUserAction(actionData) {
    try {
      const { data, error } = await this.supabase
        .from('acoes_usuarios')
        .insert([actionData])
        .select()
        .single()

      if (error) {
        console.error('Error saving user action:', error)
        throw new Error('Erro ao salvar ação do usuário')
      }

      return data
    } catch (error) {
      console.error('Error saving user action:', error)
      throw new Error('Erro ao salvar ação do usuário')
    }
  }

  /**
   * Find user action by token
   * @param {string} token Token to search for
   * @returns {Promise<Object>} User action data
   */
  async findActionByToken(token) {
    try {
      const { data, error } = await this.supabase
        .from('acoes_usuarios')
        .select('uid, type, token, status, expira_em')
        .eq('token', token)
        // .eq('type', 'reset_password')
        .single()

      if (error) {
        console.error('Error finding user action:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error finding user action:', error)
      return null
    }
  }

  /**
   * Find user action by token and code
   * @param {string} token Token to search for
   * @param {string} code Code to search for
   * @returns {Promise<Object>} User action data
   */
  async findActionByTokenAndCode(token, code) {
    try {
      const { data, error } = await this.supabase
        .from('acoes_usuarios')
        .select('*')
        .eq('token', token)
        .eq('code', code)
        // .eq('type', 'reset_password')
        .single()

      if (error) {
        console.error('Error finding user action:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error finding user action:', error)
      return null
    }
  }

  /**
   * Find user action by token, uid and code
   * @param {string} token Token to search for
   * @param {string} uid User ID
   * @param {string} code Code to search for
   * @returns {Promise<Object>} User action data
   */
  async findActionByTokenUidAndCode(token, uid, code) {
    try {
      const { data, error } = await this.supabase
        .from('acoes_usuarios')
        .select('*')
        .eq('token', token)
        .eq('uid', uid)
        .eq('code', code)
        // .eq('type', 'reset_password')
        .single()

      if (error) {
        console.error('Error finding user action:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error finding user action:', error)
      return null
    }
  }

  /**
   * Update action status
   * @param {number} actionId Action ID
   * @param {boolean} status New status
   * @returns {Promise<Object>} Updated action data
   */
  async updateActionStatus(actionId, status) {
    try {
      const { data, error } = await this.supabase
        .from('acoes_usuarios')
        .update({ status })
        .eq('id', actionId)
        .select()
        .single()

      if (error) {
        console.error('Error updating action status:', error)
        throw new Error('Erro ao atualizar status da ação')
      }

      return data
    } catch (error) {
      console.error('Error updating action status:', error)
      throw error
    }
  }
}

module.exports = UserRepository 