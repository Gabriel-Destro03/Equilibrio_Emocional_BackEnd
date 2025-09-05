'use strict'

const UsuarioDepartamentoRepository = use('App/Repositories/UsuarioDepartamentoRepository')
const UsuarioRepository = use('App/Repositories/UsuarioRepository')
const UsuarioFilialRepository = use('App/Repositories/UsuarioFilialRepository')

class UsuarioDepartamentoService {
    constructor() {
        this.repository = new UsuarioDepartamentoRepository()
        this.usuarioRepository = new UsuarioRepository()
        this.usuarioFilialRepository = new UsuarioFilialRepository()
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
            throw new Error('Este usuário já está associado a este departamento.')
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

    async getRepresentantesByDepartamento(idDepartamento) {
        if (!idDepartamento) {
            throw new Error('ID do departamento é obrigatório')
        }
        try {
            return await this.repository.getRepresentantesByDepartamentoId(idDepartamento)
        } catch (error) {
            console.error('Erro ao buscar representantes por departamento no service:', error.message)
            throw new Error(`Erro ao buscar representantes por departamento: ${error.message}`)
        }
    }

    async updateUsuarioDepartamento(idUsuario, idDepartamento, updateData) {
         // 1) Valida se o id do usuário é valido.
         const usuario = await this.usuarioRepository.getUsuarioById(idUsuario)
         if (!usuario) {
            throw new Error('Usuário não encontrado')
         }

         // Garante que o vínculo existe
         const existing = await this.repository.getByUsuarioAndDepartamento(idUsuario, idDepartamento)

         if (existing.length === 0) {
            throw new Error('Associação usuario_departamento não encontrada')
         }

         // Validação do payload
         if (updateData.is_representante === undefined) {
            throw new Error('Campo is_representante é obrigatório para atualização')
         }

         try {
            // 2) Atualizar o is_representante do departamento informado
            const updated = await this.repository.update(idUsuario, idDepartamento, { is_representante: updateData.is_representante })

            // Regras de remoção de permissões apenas quando removendo a representação
            if (updateData.is_representante === false) {
                // 3) Verificar se usuário é representante de outro departamento.
                const isRepOutroDepartamento = await this.repository.userHasAnyDepartamentoRepresentante(idUsuario)

                // 4) Caso não, remover a permissão 6
                if (!isRepOutroDepartamento) {
                    await this.repository.removeUserPermissions(idUsuario, [6])
                }

                // 5) Verificar se usuário é representante de Filial
                const isRepFilial = await this.usuarioFilialRepository.userHasAnyFilialRepresentante(idUsuario)

                // 6) Caso não, remover as permissões 1 e 4
                if (!isRepFilial) {
                    await this.repository.removeUserPermissions(idUsuario, [1, 4])
                }
            }

            return updated
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