'use strict'

const UsuarioFilialRepository = require('../Repositories/UsuarioFilialRepository')
const PermissaoService = require('./PermissaoService')
const DepartamentoService = require('./DepartamentoService')
const UsuarioDepartamentoRepository = require('../Repositories/UsuarioDepartamentoRepository')

class UsuarioFilialService {
    constructor() {
        this.repository = new UsuarioFilialRepository()
        this.permissaoService = new PermissaoService()
        this.departamentoService = new DepartamentoService()
        this.usuarioDepartamentoRepository = new UsuarioDepartamentoRepository()
    }

    async getAllUsuarioFiliais() {
        try {
            return await this.repository.getAll()
        } catch (error) {
            console.error('Erro ao buscar usuario_filial:', error.message)
            throw new Error(`Erro ao buscar usuario_filial: ${error.message}`)
        }
    }

    async getRepresentantesByFilial(request, idFilial) {
        if (!idFilial) {
            throw new Error('ID da filial é obrigatório');
        }
    
        try {
            const { empresa_id } = request.user;
    
            // 1. Busca departamentos da empresa
            const departamentos = await this.departamentoService.getByEmpresaId(empresa_id);
            const departamentosIds = departamentos.map(d => d.id);
    
            // 2. Busca representantes por departamento
            const representantesDepartamento = await this.usuarioDepartamentoRepository.getByUsuarioAndDepartamentoINIds(departamentosIds);

            // 3. Busca representantes via usuario_filial
            const representantesFilial = await this.repository.getRepresentantesByFilialId(empresa_id);
            // 4. Une e transforma os dados para o formato desejado
            let usuarios = representantesFilial.map(r => {
                const usuario = r.usuarios || {};
                const filial = r.filiais;
            
                // Busca o departamento correspondente do usuário e da filial
                const departamentoObj = representantesDepartamento.find(d =>
                    d.id_usuario === usuario.id &&
                    d.departamentos?.filiais?.id === filial.id
                );
            
                // Remove 'filiais' de dentro do departamento
                const { filiais, ...departamentoSemFiliais } = departamentoObj?.departamentos || {};
            
                return {
                    id: r.id,
                    id_usuario: Number(usuario.id),
                    id_filial: Number(filiais.id || 0),
                    created_at: r.created_at,
                    status: r.status,
                    is_representante: r.is_representante,
                    usuarios: usuario,
                    departamento: departamentoSemFiliais, // sem 'filiais'
                    filiais: filial
                };
            });
            
    
            // 5. Ordena por id_departamento e depois por id_usuario
            usuarios.sort((a, b) => {
                const depA = a.id_filial || 0;
                const depB = b.id_filial || 0;
                if (depA !== depB) return depA - depB;
    
                const userA = a.id_usuario || 0;
                const userB = b.id_usuario || 0;
                return userA - userB;
            });
    
            // 6. Remove duplicados por id_usuario, mantendo o primeiro (já ordenado)
            const deduped = Array.from(new Map(usuarios.map(u => [u.id_usuario, u])).values());
    
            return deduped;
    
        } catch (error) {
            console.error('Erro ao buscar representantes por filial no service:', error.message);
            throw new Error(`Erro ao buscar representantes por filial: ${error.message}`);
        }
    }
    
    

    async createUsuarioFilial(usuarioFilialData) {
        const { id_usuario, id_filial, is_representante } = usuarioFilialData

        if (!id_usuario || !id_filial) {
            await this.updateUsuarioFilial(id_usuario, id_filial, is_representante)
        }

        // Check if already exists
        const existing = await this.repository.getByUsuarioAndFilial(id_usuario, id_filial)
        if (existing) {
            throw new Error('Este usuário já está associado a esta filial.')
        }

        try {
            return await this.repository.create({
                id_usuario,
                id_filial,
                is_representante: is_representante || false // Default to false if not provided
            })
        } catch (error) {
            console.error('Erro ao criar usuario_filial:', error.message)
            throw new Error(`Erro ao criar usuario_filial: ${error.message}`)
        }
    }

    

    async updateUsuarioFilial(idUsuario, idFilial, updateData) {
         // Check if the relationship exists before attempting to update
         const existing = await this.repository.getByUsuarioAndFilial(idUsuario, idFilial)
         if (!existing) {
            return await this.repository.create({
                id_usuario: idUsuario,
                id_filial: idFilial,
                is_representante: true
            })
         }

         // We only allow updating is_representante for now based on requirements
         // Validate updateData has the expected structure/fields
         if (updateData.is_representante === undefined) {
             throw new Error('Campo is_representante é obrigatório para atualização')
         }

         try {
            const result = await this.repository.update(idUsuario, idFilial, updateData)
            
            // Gerenciar permissões após atualização
            if (updateData.is_representante === true) {
                // Buscar o uid do usuário para gerenciar permissões
                const usuarioData = await this.repository.getUserUid(idUsuario)
                await this.permissaoService.addRepresentativePermissions(idUsuario, usuarioData.uid, 'rep_filial')
            } else if (updateData.is_representante === false) {
                await this.permissaoService.managePermissionsAfterRepresentativeRemoval(idUsuario, 'rep_filial')
            }
            
            return result
         } catch (error) {
            console.error('Erro ao atualizar usuario_filial no service:', error.message)
            throw new Error(`Erro ao atualizar usuario_filial: ${error.message}`)
         }
    }

    async deleteUsuarioFilial(idUsuario, idFilial) {
         // Check if the relationship exists before attempting to delete
         const existing = await this.repository.getByUsuarioAndFilial(idUsuario, idFilial)
         if (!existing) {
              throw new Error('Associação usuario_filial não encontrada')
         }

        try {
            return await this.repository.delete(idUsuario, idFilial)
        } catch (error) {
            console.error('Erro ao deletar usuario_filial:', error.message)
            throw new Error(`Erro ao deletar usuario_filial: ${error.message}`)
        }
    }
}

module.exports = UsuarioFilialService 