'use strict'

const Config = use('Config')

class DepartamentoRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllDepartamentos() {
        // Primeiro busca todas as filiais
        const { data: filiaisData, error: filiaisError } = await this.supabase
            .from('filiais')
            .select('*')
            .eq('status', true)

        if (filiaisError) throw new Error(filiaisError.message)

        // Para cada filial, busca seus departamentos
        const filiaisComDepartamentos = await Promise.all(
            filiaisData.map(async (filial) => {
                const { data: departamentosData, error: departamentosError } = await this.supabase
                    .from('departamentos')
                    .select(`
                        id,
                        nome_departamento,
                        created_at,
                        status
                    `)
                    .eq('id_filial', filial.id)
                    .eq('status', true)
                    .order('created_at', { ascending: true })

                if (departamentosError) throw new Error(departamentosError.message)

                return {
                    id: filial.id,
                    nome_filial: filial.nome_filial,
                    cnpj: filial.cnpj,
                    endereco: filial.endereco,
                    status: filial.status,
                    created_at: filial.created_at,
                    departamentos: departamentosData
                }
            })
        )

        return filiaisComDepartamentos
    }

    async getDepartamentoById(id) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .eq('id', id)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getDepartamentosByFilial(filialId) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .eq('filial_id', filialId)

        if (error) throw new Error(error.message)
        return data
    }

    async createDepartamento(departamentoData) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .insert([{ ...departamentoData, status: true }])
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async updateDepartamento(id, departamentoData) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .update(departamentoData)
            .eq('id', id)
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async inactivateDepartamento(id) {
        const { data, error } = await this.supabase
            .from('departamentos')
            .update({ status: false })
            .eq('id', id)
            .select(`
                *,
                filial:filiais (
                    id,
                    nome_filial,
                    cnpj,
                    endereco
                )
            `)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getDepartamentosByUserId(uid) {
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
            return this.getAllDepartamentos()
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

        const { data: filiaisData, error: filiaisError } = await query

        if (filiaisError) throw new Error(filiaisError.message)

        // Para cada filial, buscamos seus departamentos
        const filiaisComDepartamentos = await Promise.all(
            filiaisData.map(async (item) => {
                const { data: departamentosData, error: departamentosError } = await this.supabase
                    .from('departamentos')
                    .select(`
                        id,
                        nome_departamento,
                        created_at,
                        status
                    `)
                    .eq('id_filial', item.filial.id)

                if (departamentosError) throw new Error(departamentosError.message)

                return {
                    ...item.filial,
                    departamentos: departamentosData
                }
            })
        )

        return filiaisComDepartamentos
    }
}

module.exports = DepartamentoRepository 