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
                    nome_filial
                )  
            `)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
            const usuariosFormatados = data.map(item => ({
                id: item.usuario.id,
                uid: item.usuario.uid,
                nome_completo: item.usuario.nome_completo,
                cargo: item.usuario.cargo,
                email: item.usuario.email,
                telefone: item.usuario.telefone,
                status: item.usuario.status,
                created_at: item.usuario.created_at,
                nome_filial: item.filial.nome_filial
            }))
    
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
        const { data, error } = await this.supabase
            .from('usuarios')
            .update(usuarioData)
            .eq('id', id)
            .select()
            .single()
            .order('id', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    }

    async inactivateUsuario(id) {
        const { data: usuario, error: fetchError } = await this.supabase
            .from('usuarios')
            .select('status')
            .eq('id', id)
            .single()
            .order('id', { ascending: false })

        if (fetchError) throw new Error(fetchError.message)
        if (!usuario) throw new Error('Usuário não encontrado')

        const { data, error } = await this.supabase
            .from('usuarios')
            .update({ status: !usuario.status })
            .eq('id', id)
            .select()
            .single()
            .order('id', { ascending: false })

        if (error) throw new Error(error.message)
        return data
    }

    async getUsuariosByFilial(uid) {
        // Verifica as permissões do usuário
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

        const permissoes = permissoesData.map(item => item.permissao.tag)
        const temPermissaoSuper = permissoesData.some(item => item.permissao.tag === 'internal_super')

        if(temPermissaoSuper) return this.getAllUsuarios();

        const temPermissaoAcesso = permissoes.some(tag => ['branchCreate', 'rep_filial'].includes(tag))

        if (!temPermissaoAcesso) {
            throw new Error('Usuário não tem permissão para acessar esta funcionalidade')
        }

        // Busca as filiais do usuário
        const { data: filiaisData, error: filiaisError } = await this.supabase
            .from('usuario_filial')
            .select(`
                usuario:usuarios!inner (
                    id,
                    uid
                ),
                filial:filiais (
                    id
                )
            `)
            .eq('usuario.uid', uid)

        if (filiaisError) throw new Error(filiaisError.message)

        const filiaisIds = filiaisData.map(item => item.filial.id)

        // Busca os usuários das filiais
        const { data: usuariosData, error: usuariosError } = await this.supabase
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
                    nome_filial
                )    
            `)
            .in('id_filial', filiaisIds)
            .order('usuario(created_at)', { ascending: false })

        if (usuariosError) throw new Error(usuariosError.message)

        // Formata o resultado conforme solicitado
        const usuariosFormatados = usuariosData.map(item => ({
            id: item.usuario.id,
            uid: item.usuario.uid,
            nome_completo: item.usuario.nome_completo,
            cargo: item.usuario.cargo,
            email: item.usuario.email,
            telefone: item.usuario.telefone,
            status: item.usuario.status,
            created_at: item.usuario.created_at,
            nome_filial: item.filial.nome_filial
        }))

        // Remove duplicatas mantendo o formato solicitado
        const usuariosUnicos = [...new Map(usuariosFormatados.map(item => [item.uid || item.id, item])).values()]
        return usuariosUnicos
    }
}

module.exports = UsuarioRepository 