'use strict'

const Config = use('Config')

class UsuarioRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async getAllUsuarios() {
        const { data, error } = await this.supabase
            .from('usuario_filial')
            .select(`
               usuario:usuarios(
                    id,
                    uid,
                    nome_completo,
                    cargo,
                    email,
                    telefone,
                    created_at,
                    status
                ),
                filial:filiais(
                    nome_filial,
                    id
                )  
            `)
            .order('created_at', { ascending: false })
        
            const filiaisIds = [...new Set(data.map(item => item.filial.id))];
            
            const { data: departamentosData, error: departamentosError } = await this.supabase
            .from('usuario_departamento')
            .select(`
                usuario:usuarios!inner (
                    id,
                    uid
                ),
                departamento:departamentos (
                    id,
                    id_filial,
                    nome_departamento
                )
            `)
            .in('departamentos.id_filial', filiaisIds)

        if (error) throw new Error(error.message)
        if (departamentosError) throw new Error(departamentosError.message)

        // Create a map of user departments for quick lookup
        const userDepartments = new Map()
        departamentosData.forEach(item => {
            if (item.departamento) {
                userDepartments.set(item.usuario.uid || item.usuario.id, {
                    nome: item.departamento.nome_departamento,
                    id: item.departamento.id
                })
            }
        })

        const usuariosFormatados = data.map(item => {
            const departamentoInfo = userDepartments.get(item.usuario.uid || item.usuario.id)
            return {
                id: item.usuario.id,
                uid: item.usuario.uid,
                nome_completo: item.usuario.nome_completo,
                cargo: item.usuario.cargo,
                email: item.usuario.email,
                telefone: item.usuario.telefone,
                status: item.usuario.status,
                created_at: item.usuario.created_at,
                nome_filial: item.filial.nome_filial,
                id_filial: item.filial.id,
                departamento: departamentoInfo?.nome || null,
                id_departamento: departamentoInfo?.id || null
            }
        })
    
        // Remove duplicatas mantendo o formato solicitado
        const usuariosUnicos = [...new Map(usuariosFormatados.map(item => [item.uid || item.id, item])).values()]
        return usuariosUnicos
    }

    async getUsuarioById(id) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .order('id', { ascending: false })
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    /**
     * 🔹 Busca usuários por empresa_id
     */
    async getUsuariosByEmpresaId(empresa_id) {

        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('empresa_id', empresa_id)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    }

    async getUsuariosFiliais(ids){
        const { data, error } = await this.supabase
        .from('usuario_filial')
        .select('*')
        .in('id_usuario', ids)
        .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    }

    async getUsuarioByUid(uid) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('uid', uid)
            .order('id', { ascending: false })
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getUsuariosFiliaisDepartamento(uid) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select(`
                id,
                usuario_filial (
                    id_filial,
                    is_representante
                ),
                usuario_departamento (
                    id_departamento,
                    is_representante
                )
            `)
            .eq('uid', uid)
            .maybeSingle(); // garante que só 1 usuário venha
        if (error) {
            throw new Error('Erro ao buscar usuário: ' + error.message);
        }

        if (!data) return [];

        const filiaisRepresentantes = data.usuario_filial?.filter(f => f.is_representante) || [];
        if (filiaisRepresentantes.length > 0) {
            return {
                id_filial: filiaisRepresentantes.map(f => f.id_filial)
            };
        }

        const departamentosRepresentantes = data.usuario_departamento?.filter(d => d.is_representante) || [];
        if (departamentosRepresentantes.length > 0) {
            return {
                id_departamento: departamentosRepresentantes.map(d => d.id_departamento)
            }
        }

        return []; // nenhum representante encontrado
    }
      

    async getUsuarioByEmail(email) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('status', true)
            .order('id', { ascending: false })
            .limit(1)

        if (error) throw new Error(error.message)
        return data && data.length > 0 ? data[0] : null
    }

    async createUsuario(usuarioData) {
        try {
            const { data, error } = await this.supabase
                .from('usuarios')
                .insert([{
                    nome_completo: usuarioData.nome_completo,
                    email: usuarioData.email,
                    telefone: usuarioData.telefone,
                    cargo: usuarioData.cargo,
                    status: false,
                    uid: usuarioData.uid,
                    empresa_id: usuarioData.empresa_id
                }])
                .select('*')
                .order('id', { ascending: false })
                .single()
            
            if (usuarioData.id_filial) {
                await this.supabase.from('usuario_filial')
                    .insert([{
                        id_usuario: data.id,
                            id_filial: usuarioData.id_filial
                        }]);
            }

            if (usuarioData.id_departamento) {
                await this.supabase.from('usuario_departamento')
                    .insert([{
                        id_usuario: data.id,
                        id_departamento: usuarioData.id_departamento
                    }])
            }

            if (error) {
                console.error('Erro ao criar usuário no banco:', error)
                throw new Error(error.message)
            }

            if (!data) {
                console.error('Dados do usuário não retornados após criação')
                throw new Error('Erro ao criar usuário: Dados não retornados')
            }

            return data
        } catch (error) {
            console.error('Erro na criação do usuário:', error)
            throw error
        }
    }

    /**
     * Atualiza usuário + relacionamentos (filial, departamento, etc.)
     */
    async updateUsuario(id, usuarioData) {
        const usuario = await this._atualizarUsuarioBase(id, usuarioData)

        
        // 🔹 Executa relacionamentos em paralelo
        await Promise.all([
            await this._upsertRelacionamento('usuario_filial', id, {
                id_filial: usuarioData.id_filial,
            }),
            await this._upsertRelacionamento('usuario_departamento', id, {
                id_departamento: usuarioData.id_departamento,
            }),
        ])
        return usuario
    }

    /**
     * 🔹 Atualiza dados básicos do usuário
     */
    async _atualizarUsuarioBase(id, usuarioData) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .update({
                nome_completo: usuarioData.nome_completo,
                email: usuarioData.email,
                telefone: usuarioData.telefone,
                cargo: usuarioData.cargo,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw new Error(`Erro ao atualizar usuário: ${error.message}`)
        }

        return data
    }

    /**
     * 🔹 Upsert genérico (filial, departamento, etc.)
     */
    async _upsertRelacionamento(tabela, id_usuario, valores) {
        // Verifica se já existe
        const { data: existente, error: selectError } = await this.supabase
            .from(tabela)
            .select('*')
            .eq('id_usuario', id_usuario)
            .order('id', { ascending: true })
            .limit(1)

        if (selectError) {
            throw new Error(`Erro ao verificar ${tabela}: ${selectError.message}`)
        }
        if (existente) {
            // Update
            const { error: updateError } = await this.supabase
                .from(tabela)
                .update(valores)
                .eq('id_usuario', id_usuario)

            if (updateError) {
                throw new Error(`Erro ao atualizar ${tabela}: ${updateError.message}`)
            }
        } else {
            // Insert
            const { error: insertError } = await this.supabase
                .from(tabela)
                .insert({ id_usuario, ...valores })

            if (insertError) {
                throw new Error(`Erro ao inserir em ${tabela}: ${insertError.message}`)
            }
        }
    }

    async updateUsuarioUId(id, uid) {
    
        // Atualiza o usuário
        const { data, error } = await this.supabase
            .from('usuarios')
            .update({
                uid: uid,
                status: true
            })
            .eq('id', id)
            .select()
            .single();
    
        if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    
        return data;
    }
    
    async inactivateUsuario (id, status){
        try {
            // Atualiza o status
            const { data, error} = await this.supabase
                .from('usuarios')
                .update({
                    status: status
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Erro ao atualizar usuário: ${error.message}`);
            }
            
            return data;
        } catch (error) {
            console.error('Erro no inactivateUsuario:', error);
            throw new Error(`Erro ao atualizar usuário: ${error.message}`);
        }
    }

    /**
     * Busca todos os usuários com seus relacionamentos (filiais e departamentos)
     * Sem lógica de negócio - apenas retorna os dados
     */
    async getUsuariosComRelacionamentos() {
        try {
            const { data: usuarios, error } = await this.supabase
                .from('usuarios')
                .select(`
                    id,
                    uid,
                    nome_completo,
                    cargo,
                    email,
                    telefone,
                    status,
                    created_at,
                    empresa_id,
                    usuario_filial (
                        id_filial,
                        status,
                        filiais (
                            id,
                            nome_filial
                        )
                    ),
                    usuario_departamento (
                        id_departamento,
                        status,
                        departamentos (
                            id,
                            nome_departamento
                        )
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) {
                throw new Error(`Erro ao buscar usuários: ${error.message}`)
            }

            return usuarios || []
        } catch (error) {
            console.error('Erro no getUsuariosComRelacionamentos:', error)
            throw new Error(`Erro ao buscar usuários com relacionamentos: ${error.message}`)
        }
    }    
    
    /**
     * Get user permissions
     * @param {string} userId - User ID
     * @returns {Promise<Array>} User permissions
     */
    async getUserPermissions(userId) {
        try {
            const { data, error } = await this.supabase
                .from('usuario_permissoes')
                .select(`
                    *,
                    permissoes:permissoes(*)
                `)
                .eq('uid', userId)

            if (error) {
                console.error('Erro ao buscar permissões:', error)
                throw new Error(`Erro ao buscar permissões do usuário: ${error.message}`)
            }

            return data || []
        } catch (error) {
            console.error('Erro no getUserPermissions:', error)
            throw new Error(`Erro ao buscar permissões do usuário: ${error.message}`)
        }
    }
        
}

module.exports = UsuarioRepository 