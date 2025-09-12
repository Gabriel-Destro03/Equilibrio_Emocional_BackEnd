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
    
        return data;
    }
    

    async removerRepresentante(representantes) {
        if (!Array.isArray(representantes) || representantes.length === 0) return;
    
        const usuarioIds = representantes.map(r => r.usuario_id);
        const empresaIds = representantes.map(r => r.empresa_id);
    
        const { data, error } = await this.supabase
            .from('representantes_empresas')
            .delete()
            .in('usuario_id', usuarioIds)
            .in('empresa_id', empresaIds)
            .select();
    
        if (error) throw new Error(error.message);
    
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