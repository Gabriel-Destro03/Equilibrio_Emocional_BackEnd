'use strict'

const UsuarioDepartamentoRepository = require('../Repositories/UsuarioDepartamentoRepository')
const UsuarioFilialRepository = require('../Repositories/UsuarioFilialRepository')
const PermissaoService = require('./PermissaoService')
const FilialService = require('./FilialService')
const DepartamentoService = require('./DepartamentoService')
const UsuarioService = require('./UsuarioService')

class UsuarioDepartamentoService {
    constructor() {
        this.repository = new UsuarioDepartamentoRepository()
        this.usuarioFilialRepository = new UsuarioFilialRepository()
        this.permissaoService = new PermissaoService()
        this.filialService = new FilialService()
        this.departamentoService = new DepartamentoService()
        this.usuarioService = new UsuarioService
    }

    async getAllUsuarioDepartamentos() {
        try {
            return await this.repository.getAll()
        } catch (error) {
            console.error('Erro ao buscar usuario_departamento:', error.message)
            throw new Error(`Erro ao buscar usuario_departamento: ${error.message}`)
        }
    }

    async createUsuarioDepartamento(usuarioDepartamentoData) {
        const { id_usuario, id_departamento, is_representante } = usuarioDepartamentoData

        if (!id_usuario || !id_departamento) {
            throw new Error('id_usuario e id_departamento são obrigatórios')
        }

        // Check if already exists
        const existing = await this.repository.getByUsuarioAndDepartamento(id_usuario, id_departamento)
        if (existing) {
            await this.updateUsuarioDepartamento(id_usuario, id_departamento, is_representante)
        }

        try {
            return await this.repository.create({
                id_usuario,
                id_departamento,
                is_representante: is_representante || false // Default to false if not provided
            })
        } catch (error) {
            console.error('Erro ao criar usuario_departamento:', error.message)
            throw new Error(`Erro ao criar usuario_departamento: ${error.message}`)
        }
    }

    async getRepresentantesByDepartamento(request, idDepartamento) {
        try {
            const idDepto = Number(idDepartamento);
    
            // Busca o departamento para saber a qual filial pertence
            const departamento = await this.departamentoService.getDepartamentoById(idDepto);
            
            if (!departamento) {
                throw new Error('Departamento não encontrado');
            }
            
            // Pega o ID da filial do departamento
            const idFil = departamento.filial?.id || departamento.id_filial;
            
            if (!idFil) {
                throw new Error('Filial não encontrada para este departamento');
            }
            
            // Busca TODOS os usuários da filial
            const usuariosFilial = await this.usuarioFilialRepository.getUsuariosByFilialId(idFil);
            
            // Busca também os departamentos desses usuários para montar o retorno completo
            const usuariosIds = usuariosFilial.map(uf => uf.id_usuario);
            const usuariosDepartamentos = await this.repository.getUsersByIds(usuariosIds);
            
            // Cria um mapa de usuários por departamento
            const usuariosMap = new Map();
            usuariosDepartamentos.forEach(ud => {
                if (!usuariosMap.has(ud.id_usuario)) {
                    usuariosMap.set(ud.id_usuario, []);
                }
                usuariosMap.get(ud.id_usuario).push(ud);
            });
            
            // Monta o retorno formatado
            let usuarios = usuariosFilial.map(uf => {
                const usuario = uf.usuarios || {};
                const filial = uf.filiais || {};
                
                // Busca o departamento do usuário (pode ter múltiplos)
                const deptosUsuario = usuariosMap.get(usuario.id) || [];
                const departamentoUsuario = deptosUsuario.find(d => d.id_departamento === idDepto) || deptosUsuario[0];
                
                return {
                    id: uf.id,
                    id_usuario: Number(usuario.id),
                    id_filial: Number(filial.id || 0),
                    id_departamento: departamentoUsuario ? Number(departamentoUsuario.id_departamento) : null,
                    created_at: uf.created_at,
                    status: uf.status,
                    is_representante: uf.is_representante,
                    usuarios: usuario,
                    filiais: filial,
                    departamento: departamentoUsuario || null
                };
            });
    
            // Ordena por id_usuario
            usuarios.sort((a, b) => {
                const aUser = a.id_usuario || 0;
                const bUser = b.id_usuario || 0;
                return aUser - bUser;
            });
    
            // Remove duplicados por id_usuario
            const seen = new Set();
            const deduped = [];
            for (const u of usuarios) {
                if (!seen.has(u.id_usuario)) {
                    seen.add(u.id_usuario);
                    deduped.push(u);
                }
            }
    
            return deduped;
        } catch (error) {
            console.error('Erro ao buscar representantes por departamento no service:', error.message);
            throw new Error(`Erro ao buscar representantes por departamento: ${error.message}`);
        }
    }
    
    async getRepresentantesByIdUsuario(id_usuario, id_departamento) {
        const usuarios = await this.repository.getUserByIdSingle(id_usuario);
    
        if (usuarios.length < 2) return;
    
        // Ordena pelo created_at (mais antigo primeiro) e remove o mais antigo em uma linha
        const [, ...restantes] = usuarios
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
        // Filtra apenas os que is_representante === false
        const naoRepresentantes = restantes.filter(u => u.is_representante === false);
    
        // Verifica se algum restante corresponde ao id_departamento
        const existe = naoRepresentantes.some(u => u.id_departamento === id_departamento);
    
        if (existe) {
            await this.deleteUsuarioDepartamento(id_usuario, id_departamento);
        }
    }    

    async updateUsuarioDepartamento(id_usuario, id_departamento, is_representante) {
        try {
            // Check if the relationship exists before attempting to update
            const existing = await this.repository.getByUsuarioAndDepartamento(id_usuario, id_departamento)

            if (existing.length == 0) {
                return await this.repository.create({
                    id_usuario,
                    id_departamento,
                    is_representante: true
                })
            }

            if(is_representante != true){
                this.getRepresentantesByIdUsuario(id_usuario, id_departamento)
            }

            // Atualiza o status de representante no banco
            const result = await this.repository.update(id_usuario, id_departamento, { is_representante })

            
            // Gerenciar permissões baseado no novo status
            if (is_representante === true) {
                // Buscar UID do usuário
                const usuarioData = await this.usuarioService.getUsuarioById(id_usuario)
                // Adicionar permissões de representante de departamento
                await this.permissaoService.addRepresentativePermissions(id_usuario, usuarioData.uid, 'rep_departamento')
            } else if (is_representante === false) {
                // Remover permissões de representante de departamento
                await this.permissaoService.managePermissionsAfterRepresentativeRemoval(id_usuario, 'rep_departamento')
            }

            return result
        } catch (error) {
            console.error('Erro ao atualizar usuario_departamento no service:', error.message)
            throw new Error(`Erro ao atualizar usuario_departamento: ${error.message}`)
        }
    }

    async deleteUsuarioDepartamento(idUsuario, idDepartamento) {
         // Check if the relationship exists before attempting to delete
         const existing = await this.repository.getByUsuarioAndDepartamento(idUsuario, idDepartamento)
         if (!existing) {
              throw new Error('Associação usuario_departamento não encontrada')
         }

        try {
            return await this.repository.delete(idUsuario, idDepartamento)
        } catch (error) {
            console.error('Erro ao deletar usuario_departamento:', error.message)
            throw new Error(`Erro ao deletar usuario_departamento: ${error.message}`)
        }
    }
}

module.exports = UsuarioDepartamentoService 