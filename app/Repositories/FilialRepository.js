'use strict'

const Config = use('Config')

class FilialRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllFiliais() {
        const { data, error } = await this.supabase
            .from('filiais')
            .select('*')

        if (error) throw new Error(error.message)
        return data
    }

    async getFilialById(id) {
        const { data, error } = await this.supabase
            .from('filiais')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async createFilial(filialData) {
        const { data, error } = await this.supabase
            .from('filiais')
            .insert([{ ...filialData, status: true }])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async updateFilial(id, filialData) {
        const { data, error } = await this.supabase
            .from('filiais')
            .update(filialData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async inactivateFilial(id) {
        const { data, error } = await this.supabase
            .from('filiais')
            .update({ status: false })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getFiliaisByUserId(uid) {
        // Verifica se o usuário tem permissão de super usuário
        const { data: permissoesData, error: permissoesError } = await this.supabase
            .from('usuario_permissoes')
            .select(`
                usuario:usuarios!inner (
                    uid
                ),
                permissao:permissoes (
                    tag
                )
            `)
            .eq('usuario.uid', uid)

        if (permissoesError) throw new Error(permissoesError.message)

        const temPermissaoSuper = permissoesData.some(item => item.permissao.tag === 'internal_super')

        if(temPermissaoSuper){
            return this.getAllFiliais()
        }
        // Monta a query base
        let query = this.supabase
            .from('usuario_filial')
            .select(`
                usuario:usuarios!inner (
                    id,
                    uid
                ),
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco,
                    status
                )
            `)
            .eq('filial.status', true)

        // Aplica o filtro de usuário apenas se não for super usuário
        if (!temPermissaoSuper) {
            query = query.eq('usuario.uid', uid)
        }

        const { data, error } = await query

        if (error) throw new Error(error.message)
        
        // Transforma o resultado para retornar apenas as filiais
        return data.map(item => item.filial)
    }
}

module.exports = FilialRepository