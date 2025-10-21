'use strict'

const IUsuarioService = require('../Interfaces/IUsuarioService')
const IUsuarioDepartamentoService = require('../Interfaces/IUsuarioDepartamentoService')
const IUsuarioFilialService = require('../Interfaces/IUsuarioFilialService')
const IPermissaoService = require('../Interfaces/IPermissaoService')
const IClienteService = require('../Interfaces/IClienteService')
const IAuthService = require('../Interfaces/IAuthService')

/**
 * Facade para operações complexas relacionadas a usuários
 * Centraliza a lógica de negócio que envolve múltiplos services
 */
class UsuarioFacade {
    constructor() {
        this.usuarioService = null
        this.usuarioDepartamentoService = null
        this.usuarioFilialService = null
        this.permissaoService = null
        this.clienteService = null
        this.authService = null
    }

    /**
     * Inicializa os services necessários
     * @param {IUsuarioService} usuarioService
     * @param {IUsuarioDepartamentoService} usuarioDepartamentoService
     * @param {IUsuarioFilialService} usuarioFilialService
     * @param {IPermissaoService} permissaoService
     * @param {IClienteService} clienteService
     * @param {IAuthService} authService
     */
    initializeServices(usuarioService, usuarioDepartamentoService, usuarioFilialService, permissaoService, clienteService, authService) {
        this.usuarioService = usuarioService
        this.usuarioDepartamentoService = usuarioDepartamentoService
        this.usuarioFilialService = usuarioFilialService
        this.permissaoService = permissaoService
        this.clienteService = clienteService
        this.authService = authService
    }

    /**
     * Cria usuário completo com todas as associações e permissões
     * @param {Object} usuarioData - Dados do usuário
     * @param {Object} associacoes - Associações (departamentos, filiais)
     * @returns {Promise<Object>} Usuário criado com associações
     */
    async criarUsuarioCompleto(usuarioData, associacoes = {}) {
        this._validateServices()

        try {
            // Valida dados do usuário
            await this.usuarioService.validateUsuarioData(usuarioData, false)

            // Cria usuário
            const usuario = await this.usuarioService.create(usuarioData)

            // Cria associações com departamentos
            if (associacoes.departamentos && associacoes.departamentos.length > 0) {
                for (const dept of associacoes.departamentos) {
                    await this.usuarioDepartamentoService.create({
                        id_usuario: usuario.id,
                        id_departamento: dept.id,
                        is_representante: dept.is_representante || false
                    })
                }
            }

            // Cria associações com filiais
            if (associacoes.filiais && associacoes.filiais.length > 0) {
                for (const filial of associacoes.filiais) {
                    await this.usuarioFilialService.create({
                        id_usuario: usuario.id,
                        id_filial: filial.id,
                        is_representante: filial.is_representante || false
                    })
                }
            }

            return usuario
        } catch (error) {
            throw new Error(`Erro ao criar usuário completo: ${error.message}`)
        }
    }

    /**
     * Busca usuário com todas as suas associações
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise<Object>} Usuário com associações
     */
    async buscarUsuarioComAssociacoes(usuarioId) {
        this._validateServices()

        try {
            const usuario = await this.usuarioService.getById(usuarioId)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            // Busca departamentos do usuário
            const departamentos = await this.usuarioDepartamentoService.getAll()
            const usuarioDepartamentos = departamentos.filter(ud => ud.id_usuario === usuarioId)

            // Busca filiais do usuário
            const filiais = await this.usuarioFilialService.getAll()
            const usuarioFiliais = filiais.filter(uf => uf.id_usuario === usuarioId)

            // Busca permissões do usuário
            const permissoes = await this.permissaoService.getUserPermissions(usuario.uid)

            return {
                ...usuario,
                departamentos: usuarioDepartamentos,
                filiais: usuarioFiliais,
                permissoes: permissoes
            }
        } catch (error) {
            throw new Error(`Erro ao buscar usuário com associações: ${error.message}`)
        }
    }

    /**
     * Atualiza usuário e suas associações
     * @param {number} usuarioId - ID do usuário
     * @param {Object} usuarioData - Dados do usuário
     * @param {Object} associacoes - Associações atualizadas
     * @returns {Promise<Object>} Usuário atualizado
     */
    async atualizarUsuarioComAssociacoes(usuarioId, usuarioData, associacoes = {}) {
        this._validateServices()

        try {
            // Atualiza dados do usuário
            const usuario = await this.usuarioService.update(usuarioId, usuarioData)

            // Atualiza associações com departamentos
            if (associacoes.departamentos) {
                await this._atualizarAssociacoesDepartamento(usuarioId, associacoes.departamentos)
            }

            // Atualiza associações com filiais
            if (associacoes.filiais) {
                await this._atualizarAssociacoesFilial(usuarioId, associacoes.filiais)
            }

            return usuario
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário com associações: ${error.message}`)
        }
    }

    /**
     * Remove usuário e todas as suas associações
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise<void>}
     */
    async removerUsuarioCompleto(usuarioId) {
        this._validateServices()

        try {
            const usuario = await this.usuarioService.getById(usuarioId)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            // Remove associações com departamentos
            const departamentos = await this.usuarioDepartamentoService.getAll()
            const usuarioDepartamentos = departamentos.filter(ud => ud.id_usuario === usuarioId)
            for (const ud of usuarioDepartamentos) {
                await this.usuarioDepartamentoService.delete(ud.id)
            }

            // Remove associações com filiais
            const filiais = await this.usuarioFilialService.getAll()
            const usuarioFiliais = filiais.filter(uf => uf.id_usuario === usuarioId)
            for (const uf of usuarioFiliais) {
                await this.usuarioFilialService.delete(uf.id)
            }

            // Remove usuário
            await this.usuarioService.inactivate(usuarioId)
        } catch (error) {
            throw new Error(`Erro ao remover usuário completo: ${error.message}`)
        }
    }

    /**
     * Gerenciar representante de departamento com validações
     * @param {number} usuarioId - ID do usuário
     * @param {number} departamentoId - ID do departamento
     * @param {boolean} isRepresentante - Se é representante
     * @returns {Promise<Object>} Resultado da operação
     */
    async gerenciarRepresentanteDepartamento(usuarioId, departamentoId, isRepresentante) {
        this._validateServices()

        try {
            // Valida se usuário pode ser representante
            const canBeRepresentative = await this.usuarioDepartamentoService.canBeRepresentative(usuarioId, departamentoId)
            if (!canBeRepresentative) {
                throw new Error('Usuário não pode ser representante deste departamento')
            }

            // Atualiza representante
            const resultado = await this.usuarioDepartamentoService.updateUsuarioDepartamento(usuarioId, departamentoId, isRepresentante)

            // Gerencia permissões
            await this.usuarioDepartamentoService.manageRepresentativePermissions(usuarioId, isRepresentante)

            return resultado
        } catch (error) {
            throw new Error(`Erro ao gerenciar representante de departamento: ${error.message}`)
        }
    }

    /**
     * Gerenciar representante de filial com validações
     * @param {number} usuarioId - ID do usuário
     * @param {number} filialId - ID da filial
     * @param {Object} updateData - Dados da atualização
     * @returns {Promise<Object>} Resultado da operação
     */
    async gerenciarRepresentanteFilial(usuarioId, filialId, updateData) {
        this._validateServices()

        try {
            // Valida se usuário pode ser representante
            const canBeRepresentative = await this.usuarioFilialService.canBeRepresentative(usuarioId, filialId)
            if (!canBeRepresentative) {
                throw new Error('Usuário não pode ser representante desta filial')
            }

            // Atualiza representante
            const resultado = await this.usuarioFilialService.updateUsuarioFilial(usuarioId, filialId, updateData)

            // Gerencia permissões
            await this.usuarioFilialService.manageRepresentativePermissions(usuarioId, updateData)

            return resultado
        } catch (error) {
            throw new Error(`Erro ao gerenciar representante de filial: ${error.message}`)
        }
    }

    /**
     * Processo completo de criação de cliente
     * @param {Object} clienteData - Dados do cliente
     * @returns {Promise<Object>} Cliente criado
     */
    async criarClienteCompleto(clienteData) {
        this._validateServices()

        try {
            // Valida dados do cliente
            await this.clienteService.validateClienteData(clienteData, false)

            // Cria cliente usando o service
            const cliente = await this.clienteService.create(clienteData)

            return cliente
        } catch (error) {
            throw new Error(`Erro ao criar cliente completo: ${error.message}`)
        }
    }

    /**
     * Processo completo de autenticação
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Dados de autenticação
     */
    async autenticarUsuario(email, password) {
        this._validateServices()

        try {
            return await this.authService.login(email, password)
        } catch (error) {
            throw new Error(`Erro ao autenticar usuário: ${error.message}`)
        }
    }

    /**
     * Processo completo de recuperação de senha
     * @param {string} email - Email do usuário
     * @returns {Promise<Object>} Resultado da operação
     */
    async recuperarSenha(email) {
        this._validateServices()

        try {
            return await this.authService.forgotPassword(email)
        } catch (error) {
            throw new Error(`Erro ao recuperar senha: ${error.message}`)
        }
    }

    /**
     * Atualiza associações de departamento
     * @private
     */
    async _atualizarAssociacoesDepartamento(usuarioId, departamentos) {
        // Remove associações existentes
        const existentes = await this.usuarioDepartamentoService.getAll()
        const usuarioDepartamentos = existentes.filter(ud => ud.id_usuario === usuarioId)
        
        for (const ud of usuarioDepartamentos) {
            await this.usuarioDepartamentoService.delete(ud.id)
        }

        // Cria novas associações
        for (const dept of departamentos) {
            await this.usuarioDepartamentoService.create({
                id_usuario: usuarioId,
                id_departamento: dept.id,
                is_representante: dept.is_representante || false
            })
        }
    }

    /**
     * Atualiza associações de filial
     * @private
     */
    async _atualizarAssociacoesFilial(usuarioId, filiais) {
        // Remove associações existentes
        const existentes = await this.usuarioFilialService.getAll()
        const usuarioFiliais = existentes.filter(uf => uf.id_usuario === usuarioId)
        
        for (const uf of usuarioFiliais) {
            await this.usuarioFilialService.delete(uf.id)
        }

        // Cria novas associações
        for (const filial of filiais) {
            await this.usuarioFilialService.create({
                id_usuario: usuarioId,
                id_filial: filial.id,
                is_representante: filial.is_representante || false
            })
        }
    }

    /**
     * Valida se os services foram inicializados
     * @private
     */
    _validateServices() {
        if (!this.usuarioService || !this.usuarioDepartamentoService || !this.usuarioFilialService || 
            !this.permissaoService || !this.clienteService || !this.authService) {
            throw new Error('Services não foram inicializados. Chame initializeServices() primeiro.')
        }
    }
}

module.exports = UsuarioFacade
