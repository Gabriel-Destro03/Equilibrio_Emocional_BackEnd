'use strict'

const Config = use('Config')

class EmpresaRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllEmpresas() {
        const { data, error } = await this.supabase
            .from('empresas')
            .select('*')
        if (error) throw new Error(error.message)
        return data
    }

    async getEmpresaById(id) {
        const { data, error } = await this.supabase
            .from('empresas')
            .select('*')
            .eq('id', id)
            .single()
        if (error) throw new Error(error.message)
        return data
    }

    async getEmpresaByCnpj(cnpj) {
        const { data, error } = await this.supabase
            .from('empresas')
            .select('*')
            .eq('cnpj', cnpj)
            .single()
    }

    async createEmpresa(empresaData) {
        const { data, error } = await this.supabase
            .from('empresas')
            .insert([{ ...empresaData }])
            .select()
            .single()
        if (error) throw new Error(error.message)
        return data
    }

    async updateEmpresa(id, empresaData) {
        const { data, error } = await this.supabase
            .from('empresas')
            .update(empresaData)
            .eq('id', id)
            .select()
            .single()
        if (error) throw new Error(error.message)
        return data
    }

    async inactivateEmpresa(id) {
        const { data, error } = await this.supabase
            .from('empresas')
            .update({ status: 'inativo' })
            .eq('id', id)
            .select()
            .single()
        if (error) throw new Error(error.message)
        return data
    }



    // Representantes da Empresa
    async buscarRepresentantes(id) {
        const { data, error } = await this.supabase
            .from('representantes_empresas')
            .select('*')
            .eq('empresa_id', id)
        if (error) throw new Error(error.message)
        return data
    }

    async criarRepresentante(representantes) {
        if (!Array.isArray(representantes) || representantes.length === 0) return;
    
        const { data, error } = await this.supabase
            .from('representantes_empresas')
            .insert(representantes)
            .select();
    
        if (error) throw new Error(error.message);
    
        // Se inseriu representantes, cria permissões para cada um
        if (data && data.length > 0) {
            representantes.forEach(async rep => {
                // 1. Buscar as Permissões do usuario
                const { data: permissoes, error: errorPermissoes } = await this.supabase
                    .from('usuario_permissoes')
                    .select('*')
                    .eq('uid', rep.usuario_uid)


                if (errorPermissoes) throw new Error(errorPermissoes.message)
                // 2. Verificar quais permissões estão faltando
                const idsPermissoes = [1, 2, 3, 4, 5, 6, 9]; // lista de permissões fixas

                // 3. Criar as permissões que estão faltando
                const permissoesFaltantes = idsPermissoes.filter(id => !permissoes.some(p => p.id_permissao === id))

                // 4. Criar as permissões que estão faltando
                const { data: permissoesCriadas, error: errorPermissoesCriadas } = await this.supabase
                    .from('usuario_permissoes')
                    .insert(permissoesFaltantes)

                if (errorPermissoesCriadas) throw new Error(errorPermissoesCriadas.message)

            })
        }
    
        return data;
    }
    

    async removerRepresentante(representantes) {
        if (!Array.isArray(representantes) || representantes.length === 0) return;
    
        const usuarioIds = representantes.map(r => r.usuario_id);
        const empresaIds = representantes.map(r => r.empresa_id);
    
        // Remove da tabela representantes_empresas
        const { data, error } = await this.supabase
            .from('representantes_empresas')
            .delete()
            .in('usuario_id', usuarioIds)
            .in('empresa_id', empresaIds)
            .select();
    
        if (error) throw new Error(error.message);
    
        // Se removeu representantes, também remove as permissões associadas
        if (data && data.length > 0) {
            const idsPermissoes = [9]; // lista fixa de permissões a remover
    
            const { error: errorPermissao } = await this.supabase
                .from('usuario_permissoes')
                .delete()
                .in('id_user', usuarioIds)
                .in('id_permissao', idsPermissoes);
    
            if (errorPermissao) throw new Error(errorPermissao.message);
        }
    
        return data;
    }
    

    async getRepresentantesByEmpresaId(empresaId) {
        if (!empresaId) {
            throw new Error('ID da empresa é obrigatório')
        }
        const { data, error } = await this.supabase
            .from('representantes_empresas')
            .select('*, usuario:usuarios(*)')
            .eq('empresa_id', empresaId)
        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = EmpresaRepository 