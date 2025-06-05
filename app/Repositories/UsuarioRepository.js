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
                    status: true,
                    uid: usuarioData.uid
                }])
                .select('*')
                .order('id', { ascending: false })
                .single()

            await this.supabase.from('usuario_filial')
                .insert([{
                    id_usuario: data.id,
                    id_filial: usuarioData.id_filial
                }]);

            await this.supabase.from('usuario_departamento')
                .insert([{
                    id_usuario: data.id,
                    id_departamento: usuarioData.id_departamento
                }])


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

    async updateUsuario(id, usuarioData) {
        const supabase = this.supabase;
    
        // Atualiza o usuário
        const { data, error } = await supabase
            .from('usuarios')
            .update({
                nome_completo: usuarioData.nome_completo,
                email: usuarioData.email,
                telefone: usuarioData.telefone,
                cargo: usuarioData.cargo,
            })
            .eq('id', id)
            .select()
            .single();
    
        if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    
        // Executa atualizações em paralelo (filial e departamento)
        const [filialResult, departamentoResult] = await Promise.all([
            supabase
                .from('usuario_filial')
                .update({ id_filial: usuarioData.id_filial })
                .eq('id_usuario', id),
    
            supabase
                .from('usuario_departamento')
                .update({ id_departamento: usuarioData.id_departamento })
                .eq('id_usuario', id)
        ]);
    
        // Verifica erros nas atualizações paralelas
        if (filialResult.error) {
            throw new Error(`Erro ao atualizar filial: ${filialResult.error.message}`);
        }
    
        if (departamentoResult.error) {
            throw new Error(`Erro ao atualizar departamento: ${departamentoResult.error.message}`);
        }
    
        return data;
    }
    

    async getUsuariosByFilial(uid) {
        const supabase = this.supabase;
    
        // 1. Verifica as permissões do usuário
        const { data: permissoesData, error: permissoesError } = await supabase
            .from('usuario_permissoes')
            .select(`
                usuario:usuarios!inner(uid, id),
                permissao:permissoes(tag)
            `)
            .eq('usuario.uid', uid);
    
        if (permissoesError) throw new Error(`Erro ao buscar permissões: ${permissoesError.message}`);
    
        const permissoes = permissoesData.map(p => p.permissao.tag);
        const temPermissaoSuper = permissoes.includes('internal_super');
    
        if (temPermissaoSuper) return this.getAllUsuarios();
    
        const temPermissaoAcesso = permissoes.some(tag =>
            ['branchCreate', 'rep_filial'].includes(tag)
        );
    
        if (!temPermissaoAcesso) {
            throw new Error('Usuário não tem permissão para acessar esta funcionalidade');
        }
        
        // Extrai ID do usuário (assume que todas as linhas retornadas têm o mesmo `usuario.id`)
        const idUsuario = permissoesData[0].usuario.id;

        // 2. Busca as filiais do usuário
        const { data: filiaisData, error: filiaisError } = await supabase
            .from('usuario_filial')
            .select(`
                filial:filiais(id)
            `)
            .eq('id_usuario', idUsuario); // Melhor usar `id_usuario` se `usuario.uid` for igual a `usuarios.uid`
    
        if (filiaisError) throw new Error(`Erro ao buscar filiais: ${filiaisError.message}`);
    
        const filiaisIds = [...new Set(filiaisData.map(f => f.filial?.id).filter(Boolean))];
        if (filiaisIds.length === 0) return [];
    
        // 3. Busca usuários e departamentos das filiais em paralelo
        const [usuariosResult, departamentosResult] = await Promise.all([
            supabase
                .from('usuario_filial')
                .select(`
                    usuario:usuarios(
                        id, uid, nome_completo, cargo,
                        email, telefone, created_at, status
                    ),
                    filial:filiais(id, nome_filial)
                `)
                .in('id_filial', filiaisIds),
                // .order('usuario.created_at', { ascending: false }),
    
            supabase
                .from('usuario_departamento')
                .select(`
                    usuario:usuarios!inner(id, uid),
                    departamento:departamentos(id, id_filial, nome_departamento)
                `)
                .in('departamentos.id_filial', filiaisIds)
        ]);
    
        if (usuariosResult.error) throw new Error(`Erro ao buscar usuários: ${usuariosResult.error.message}`);
        if (departamentosResult.error) throw new Error(`Erro ao buscar departamentos: ${departamentosResult.error.message}`);
    
        const usuariosData = usuariosResult.data;
        const departamentosData = departamentosResult.data;
    
        // 4. Mapeia departamentos por usuário
        const userDepartments = new Map();
        for (const { usuario, departamento } of departamentosData) {
            if (usuario && departamento) {
                userDepartments.set(usuario.uid || usuario.id, {
                    nome: departamento.nome_departamento,
                    id: departamento.id
                });
            }
        }
    
        // 5. Formata usuários e remove duplicatas
        const usuariosFormatados = usuariosData.map(({ usuario, filial }) => {
            const dep = userDepartments.get(usuario.uid || usuario.id);
            return {
                id: usuario.id,
                uid: usuario.uid,
                nome_completo: usuario.nome_completo,
                cargo: usuario.cargo,
                email: usuario.email,
                telefone: usuario.telefone,
                status: usuario.status,
                created_at: usuario.created_at,
                nome_filial: filial?.nome_filial || null,
                id_filial: filial?.id || null,
                departamento: dep?.nome || null,
                id_departamento: dep?.id || null
            };
        });
    
        // Remove duplicatas
        const usuariosUnicos = [
            ...new Map(usuariosFormatados.map(u => [u.uid || u.id, u])).values()
        ];

        // Ordena do mais recente para o mais antigo
        usuariosUnicos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return usuariosUnicos;
    }
    
}

module.exports = UsuarioRepository 