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


        // const usuariosComFilial = await this._buscarUsuariosComFiliais(empresa_id)
        // const filiaisIds = this._extrairFiliaisIds(usuariosComFilial)
        // const departamentos = await this._buscarDepartamentos(filiaisIds)
        // const departamentosMap = this._mapearDepartamentos(departamentos)

        // const usuariosFormatados = this._formatarUsuarios(usuariosComFilial, departamentosMap)

        // return this._removerDuplicados(usuariosFormatados)
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

    /**
     * 🔹 Query departamentos por filiais
     */
    async _buscarDepartamentos(filiaisIds) {
        if (!filiaisIds.length) return []

        const { data, error } = await this.supabase
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

        return data
    }

    /**
     * 🔹 Extrai IDs únicos de filiais
     */
    _extrairFiliaisIds(data) {
        return [...new Set(data.map(item => item.filial.id))]
    }

    /**
     * 🔹 Cria um map { usuarioId/uid -> departamento }
     */
    _mapearDepartamentos(departamentos) {
        const map = new Map()
        departamentos.forEach(item => {
            if (item.departamento) {
                const key = item.usuario.uid || item.usuario.id
                map.set(key, {
                    nome: item.departamento.nome_departamento,
                    id: item.departamento.id
                })
            }
        })
        return map
    }

    /**
     * 🔹 Formata os dados finais
     */
    _formatarUsuarios(data, departamentosMap) {
        return data.map(item => {
            const usuario = item.usuario
            const filial = item.filial
            const departamentoInfo = departamentosMap.get(usuario.uid || usuario.id)

            return {
                id: usuario.id,
                uid: usuario.uid,
                nome_completo: usuario.nome_completo,
                cargo: usuario.cargo,
                email: usuario.email,
                telefone: usuario.telefone,
                status: usuario.status,
                created_at: usuario.created_at,
                nome_filial: filial.nome_filial,
                id_filial: filial.id,
                departamento: departamentoInfo?.nome || null,
                id_departamento: departamentoInfo?.id || null
            }
        })
    }

    /**
     * 🔹 Remove duplicados por uid/id
     */
    _removerDuplicados(usuarios) {
        return [...new Map(usuarios.map(item => [item.uid || item.id, item])).values()]
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

        console.log(usuarioData)
        // 🔹 Executa relacionamentos em paralelo
        await Promise.all([
            this._upsertRelacionamento('usuario_filial', id, {
                id_filial: usuarioData.id_filial,
            }),
            this._upsertRelacionamento('usuario_departamento', id, {
                id_departamento: usuarioData.id_departamento,
            }),
        ])
        console.log('Fim')
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
            .select('id')
            .eq('id_usuario', id_usuario)
            .maybeSingle()

        if (selectError) {
            throw new Error(`Erro ao verificar ${tabela}: ${selectError.message}`)
        }

        if (existente) {
            console.log('Existe')
            // Update
            const { error: updateError } = await this.supabase
                .from(tabela)
                .update(valores)
                .eq('id_usuario', id_usuario)

            if (updateError) {
                throw new Error(`Erro ao atualizar ${tabela}: ${updateError.message}`)
            }
        } else {
            console.log('Não Existe')
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

    async getUsuariosByFilial(uid, isAdm, isRepresentanteFilial,isRepresentanteDepartamento) {
        try {
            // 2. Busca filiais e departamentos representados
            const { data: userData, error: errorUser } = await this.supabase
              .from('usuarios')
              .select(`
                id,
                nome_completo,
                uid,
                usuario_departamento (
                  id_departamento,
                  is_representante
                ),
                usuario_filial (
                  id_filial,
                  is_representante
                )
              `)
              .eq('uid', uid)
              .single();
          
            if (errorUser || !userData) {
              console.error('Erro ao buscar dados do usuário:', errorUser);
              return [];
            }
      
        const idsFiliaisRepresentante = userData.usuario_filial
          ?.filter(f => f.is_representante)
          .map(f => f.id_filial) ?? [];
      
        const idsDepartamentosRepresentante = userData.usuario_departamento
          ?.filter(d => d.is_representante)
          .map(d => d.id_departamento) ?? [];
      
        if (!isAdm && idsFiliaisRepresentante.length === 0 && idsDepartamentosRepresentante.length === 0) {
          return [];
        }
      
        // 3. Busca todos os usuários com vínculos
        let { data: usuarios, error: errorUsuarios } = await this.supabase
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
            usuario_filial (
              id_filial,
              filiais (
                id,
                nome_filial
              )
            ),
            usuario_departamento (
              id_departamento,
              departamentos (
                id,
                nome_departamento
              )
            )
          `);
      
        if (errorUsuarios || !usuarios) {
          console.error('Erro ao buscar usuários:', errorUsuarios);
          return [];
        }
      
        // 4. Filtra se não for ADM
        if (!isAdm) {
          const podeFiltrarPorFilial = isRepresentanteFilial && idsFiliaisRepresentante.length > 0;
          const podeFiltrarPorDepartamento = isRepresentanteDepartamento && idsDepartamentosRepresentante.length > 0;
      
          if (podeFiltrarPorFilial) {
            usuarios = usuarios.filter(u =>
              u.usuario_filial?.[0] &&
              idsFiliaisRepresentante.includes(u.usuario_filial[0].id_filial)
            );
          } else if (podeFiltrarPorDepartamento) {
            usuarios = usuarios.filter(u =>
              u.usuario_departamento?.[0] &&
              idsDepartamentosRepresentante.includes(u.usuario_departamento[0].id_departamento)
            );
          } else {
            return [];
          }
        }
      
        // 5. Formata resultado final
        const usuariosFormatados = usuarios.map(u => {
          const filial = u.usuario_filial?.[0]?.filiais ?? {};
          const departamento = u.usuario_departamento?.[0]?.departamentos ?? {};
      
          return {
            id: u.id,
            uid: u.uid,
            nome_completo: u.nome_completo,
            cargo: u.cargo,
            email: u.email,
            telefone: u.telefone,
            status: u.status,
            created_at: u.created_at,
            nome_filial: filial.nome_filial ?? null,
            id_filial: filial.id ?? null,
            departamento: departamento.nome_departamento ?? null,
            id_departamento: departamento.id ?? null
          };
        });
      
        // 6. Ordena do mais recente para o mais antigo
        usuariosFormatados.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
        return usuariosFormatados;
        } catch (error) {
            console.error('Erro no getUsuariosByFilial:', error);
            throw new Error(`Erro ao buscar usuários da filial: ${error.message}`);
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