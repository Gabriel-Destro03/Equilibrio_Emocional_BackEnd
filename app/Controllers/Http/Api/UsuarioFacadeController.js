'use strict'

const UsuarioFacade = require('../../../Facades/UsuarioFacade')
const UsuarioService = require('../../../Services/UsuarioService')
const UsuarioDepartamentoService = require('../../../Services/UsuarioDepartamentoService')
const UsuarioFilialService = require('../../../Services/UsuarioFilialService')
const PermissaoService = require('../../../Services/PermissaoService')
const ClienteService = require('../../../Services/ClienteService')
const AuthService = require('../../../Services/AuthService')

/**
 * Controller que demonstra o uso do Facade para operações complexas de usuários
 * Este controller centraliza operações que envolvem múltiplos services
 */
class UsuarioFacadeController {
    constructor() {
        this.facade = new UsuarioFacade()
        
        // Inicializa o facade com todos os services necessários
        const usuarioService = new UsuarioService()
        const usuarioDepartamentoService = new UsuarioDepartamentoService()
        const usuarioFilialService = new UsuarioFilialService()
        const permissaoService = new PermissaoService()
        const clienteService = new ClienteService()
        const authService = new AuthService()
        
        this.facade.initializeServices(
            usuarioService,
            usuarioDepartamentoService,
            usuarioFilialService,
            permissaoService,
            clienteService,
            authService
        )
    }

    /**
     * Cria usuário completo com todas as associações
     */
    async criarUsuarioCompleto({ request, response }) {
        try {
            const usuarioData = request.only(['nome_completo', 'email', 'telefone', 'cargo', 'empresa_id'])
            const associacoes = request.only(['departamentos', 'filiais'])

            const usuario = await this.facade.criarUsuarioCompleto(usuarioData, associacoes)
            
            return response.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: usuario
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Busca usuário com todas as suas associações
     */
    async buscarUsuarioComAssociacoes({ params, response }) {
        try {
            const usuario = await this.facade.buscarUsuarioComAssociacoes(params.id)
            
            return response.status(200).json({
                success: true,
                data: usuario
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Atualiza usuário e suas associações
     */
    async atualizarUsuarioComAssociacoes({ params, request, response }) {
        try {
            const usuarioData = request.only(['nome_completo', 'email', 'telefone', 'cargo'])
            const associacoes = request.only(['departamentos', 'filiais'])

            const usuario = await this.facade.atualizarUsuarioComAssociacoes(
                params.id, 
                usuarioData, 
                associacoes
            )
            
            return response.status(200).json({
                success: true,
                message: 'Usuário atualizado com sucesso',
                data: usuario
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Remove usuário e todas as suas associações
     */
    async removerUsuarioCompleto({ params, response }) {
        try {
            await this.facade.removerUsuarioCompleto(params.id)
            
            return response.status(200).json({
                success: true,
                message: 'Usuário removido com sucesso'
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Gerencia representante de departamento com validações completas
     */
    async gerenciarRepresentanteDepartamento({ request, response }) {
        try {
            const { usuario_id, departamento_id, is_representante } = request.only([
                'usuario_id', 
                'departamento_id', 
                'is_representante'
            ])

            const resultado = await this.facade.gerenciarRepresentanteDepartamento(
                usuario_id, 
                departamento_id, 
                is_representante
            )
            
            return response.status(200).json({
                success: true,
                message: 'Representante de departamento gerenciado com sucesso',
                data: resultado
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Gerencia representante de filial com validações completas
     */
    async gerenciarRepresentanteFilial({ request, response }) {
        try {
            const { usuario_id, filial_id, updateData } = request.only([
                'usuario_id', 
                'filial_id', 
                'updateData'
            ])

            const resultado = await this.facade.gerenciarRepresentanteFilial(
                usuario_id, 
                filial_id, 
                updateData
            )
            
            return response.status(200).json({
                success: true,
                message: 'Representante de filial gerenciado com sucesso',
                data: resultado
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Cria cliente completo usando o Facade
     */
    async criarClienteCompleto({ request, response }) {
        try {
            const clienteData = request.only(['usuario', 'empresa'])

            const cliente = await this.facade.criarClienteCompleto(clienteData)
            
            return response.status(201).json({
                success: true,
                message: 'Cliente criado com sucesso',
                data: cliente
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Autentica usuário usando o Facade
     */
    async autenticarUsuario({ request, response }) {
        try {
            const { email, password } = request.only(['email', 'password'])

            const authData = await this.facade.autenticarUsuario(email, password)
            
            return response.status(200).json({
                success: true,
                message: 'Usuário autenticado com sucesso',
                data: authData
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    /**
     * Recupera senha usando o Facade
     */
    async recuperarSenha({ request, response }) {
        try {
            const { email } = request.only(['email'])

            const resultado = await this.facade.recuperarSenha(email)
            
            return response.status(200).json({
                success: true,
                message: 'Solicitação de recuperação de senha enviada',
                data: resultado
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                error: error.message
            })
        }
    }
}

module.exports = UsuarioFacadeController
