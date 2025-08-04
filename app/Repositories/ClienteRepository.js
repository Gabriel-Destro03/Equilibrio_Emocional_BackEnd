'use strict'

const Config = use('Config')

class ClienteRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    /**
     * Verifica se já existe um cliente com o email fornecido
     * @param {string} email - Email a ser verificado
     * @returns {Promise<boolean>} True se existe, false caso contrário
     */
    async clienteExistsByEmail(email) {
        try {
            const { data, error } = await this.supabase
                .from('usuarios')
                .select('id')
                .eq('email', email)
                .not('empresa_id', 'is', null)
                .single()

            if (error && error.code !== 'PGRST116') throw new Error(error.message)
            return !!data

        } catch (error) {
            throw new Error(`Erro ao verificar existência do cliente: ${error.message}`)
        }
    }

    /**
     * Verifica se já existe uma empresa com o CNPJ fornecido
     * @param {string} cnpj - CNPJ a ser verificado
     * @returns {Promise<boolean>} True se existe, false caso contrário
     */
    async empresaExistsByCnpj(cnpj) {
        try {
            const { data, error } = await this.supabase
                .from('empresas')
                .select('id')
                .eq('cnpj', cnpj)
                .single()

            if (error && error.code !== 'PGRST116') throw new Error(error.message)
            return !!data

        } catch (error) {
            throw new Error(`Erro ao verificar existência da empresa: ${error.message}`)
        }
    }

    async createEmpresa(empresa) {
        try {
            const { data, error } = await this.supabase
                .from('empresas')
                .insert({
                    nome_fantasia: empresa.nome_fantasia,
                    cnpj: empresa.cnpj,
                    razao_social: empresa.razao_social,
                    status: true
                })
                .select('id')
                .single()
            if (error) throw new Error(error.message)
            return data
        } catch (error) {
            throw new Error(`Erro ao criar empresa: ${error.message}`)
        }
    }

    async createAuthUser(email, password) {
        try {
            const { data, error } = await this.supabase
                .auth.signUp({
                    email: email,
                    password: password
                })
            if (error) throw new Error(error.message)
            return data
        } catch (error) {
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }
    
    async createUsuario(usuario) {
        try {
            const { data, error } = await this.supabase
                .from('usuarios')
                .insert({
                    nome_completo: usuario.nome_completo,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    cargo: usuario.cargo,
                    status: false,
                    uid: usuario.uid,
                    empresa_id: usuario.empresa_id,
                    status: true
                })
                .select('*')
                .single();

            if (error) throw new Error(error.message)
            return data
        } catch (error) {
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }
}

module.exports = ClienteRepository 