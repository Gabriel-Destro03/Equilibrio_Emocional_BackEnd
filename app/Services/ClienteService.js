'use strict'

const ClienteRepository = require('../Repositories/ClienteRepository')
const UsuarioService = require('./UsuarioService')
const EmpresaService = require('./EmpresaService')
const SendEmail = require('./Emails/SendEmail')
const PasswordGenerator = require('../Utils/PasswordGenerator')
const crypto = require('crypto')

/**
 * Serviço responsável pela lógica de negócios relacionada aos clientes
 */
class ClienteService {
    constructor() {
        this.repository = new ClienteRepository()
        this.usuarioService = new UsuarioService()
        this.empresaService = new EmpresaService()
    }

    /**
     * Retorna todos os clientes
     * @returns {Promise<Array>} Lista de clientes
     * @throws {Error} Erro ao buscar clientes
     */
    async getAllClientes() {
        try {
            return await this.repository.getAllClientes()
        } catch (error) {
            throw new Error(`Erro ao buscar clientes: ${error.message}`)
        }
    }

    /**
     * Busca um cliente pelo ID
     * @param {number} id - ID do cliente
     * @returns {Promise<Object>} Dados do cliente
     * @throws {Error} Erro ao buscar cliente ou cliente não encontrado
     */
    async getClienteById(id) {
        if (!id) {
            throw new Error('ID do cliente é obrigatório')
        }

        try {
            const cliente = await this.repository.getClienteById(id)
            if (!cliente) {
                throw new Error('Cliente não encontrado')
            }
            return cliente
        } catch (error) {
            throw new Error(`Erro ao buscar cliente: ${error.message}`)
        }
    }

    /**
     * Cria um novo cliente
     * @param {Object} clienteData - Dados do cliente
     * @param {Object} clienteData.usuario - Dados do usuário
     * @param {Object} clienteData.empresa - Dados da empresa
     * @returns {Promise<Object>} Cliente criado
     * @throws {Error} Erro ao criar cliente
     */
    async createCliente(clienteData) {
        const { usuario, empresa } = clienteData

        // Validações básicas
        if (!usuario || !empresa) {
            throw new Error('Dados do usuário e empresa são obrigatórios')
        }

        if (!usuario.nome || !usuario.email || !usuario.telefone || !usuario.cargo) {
            throw new Error('Dados obrigatórios do usuário: nome, email, telefone e cargo')
        }

        if (!empresa.razaoSocial || !empresa.cnpj) {
            throw new Error('Dados obrigatórios da empresa: razaoSocial e cnpj')
        }

        // Validação de senha (opcional para clientes)
        if (usuario.senha && usuario.confirmarSenha && usuario.senha !== usuario.confirmarSenha) {
            throw new Error('As senhas não coincidem')
        }

        if (usuario.senha && usuario.senha.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres')
        }

        try {
            // 1. Verificar se o cliente já existe
            const clienteExistente = await this.repository.clienteExistsByEmail(usuario.email)
            if (clienteExistente) {
                throw new Error('Não foi possível cadastrar: o e-mail informado já está em uso.');
            }

            // 2. Verificar se a empresa já existe
            const empresaExistente = await this.repository.empresaExistsByCnpj(empresa.cnpj)
            if (empresaExistente) {
                throw new Error('Não foi possível cadastrar: o CNPJ informado já está em uso.');
            }

            // 3. Criar empresa
            const empresaCriada = await this.repository.createEmpresa({
                nome_fantasia: empresa.nomeFantasia,
                cnpj: empresa.cnpj,
                razao_social: empresa.razaoSocial
            })

            // 4. Criar usuário e autenticação
            const authData = await this.repository.createAuthUser(usuario.email, usuario.senha)

            // 5. Criar usuário
            const usuarioCriado = await this.repository.createUsuario({
                nome_completo: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                cargo: usuario.cargo,
                uid: authData.user.id,
                empresa_id: empresaCriada.id
            })

            // 6. Enviar e-mail de boas-vindas
            await SendEmail.sendCodigoClienteEmail(usuarioCriado.email, usuarioCriado.nome_completo, usuarioCriado.uid)


            // 8. Adicionar as permissões do cliente
            await this.repository.createPermissaoCliente(usuarioCriado.id, authData.user.id)
            
            // 7. Retornar dados do cliente criado
            return {
                id: usuarioCriado.id,
                usuario: {
                    id: usuarioCriado.id,
                    nome: usuarioCriado.nome_completo,
                    email: usuarioCriado.email,
                    telefone: usuarioCriado.telefone,
                    cargo: usuarioCriado.cargo,
                    status: usuarioCriado.status
                },
                empresa: {
                    id: empresaCriada.id,
                    razao_social: empresaCriada.razao_social,
                    cnpj: empresaCriada.cnpj,
                    nome_empresa: empresaCriada.nome_empresa
                }
            }

        } catch (error) {
            throw new Error(`${error.message}`)
        }
    }

    /**
     * Atualiza um cliente existente
     * @param {number} id - ID do cliente
     * @param {Object} clienteData - Dados do cliente
     * @returns {Promise<Object>} Cliente atualizado
     * @throws {Error} Erro ao atualizar cliente
     */
    async updateCliente(id, clienteData) {
        if (!id) {
            throw new Error('ID do cliente é obrigatório')
        }

        const { usuario, empresa } = clienteData

        try {
            // Buscar cliente existente
            const clienteExistente = await this.getClienteById(id)
            if (!clienteExistente) {
                throw new Error('Cliente não encontrado')
            }

            // Atualizar usuário se fornecido
            let usuarioAtualizado = null
            if (usuario) {
                usuarioAtualizado = await this.usuarioService.updateUsuario(clienteExistente.usuario.id, {
                    nome_completo: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    cargo: usuario.cargo
                })
            }

            // Atualizar empresa se fornecida
            let empresaAtualizada = null
            if (empresa) {
                empresaAtualizada = await this.empresaService.updateEmpresa(clienteExistente.empresa.id, {
                    nome_empresa: empresa.razaoSocial,
                    cnpj: empresa.cnpj,
                    razao_social: empresa.razaoSocial
                })
            }

            return {
                id: clienteExistente.id,
                usuario: usuarioAtualizado || clienteExistente.usuario,
                empresa: empresaAtualizada || clienteExistente.empresa,
                updated_at: new Date()
            }

        } catch (error) {
            throw new Error(`Erro ao atualizar cliente: ${error.message}`)
        }
    }

    /**
     * Remove um cliente
     * @param {number} id - ID do cliente
     * @throws {Error} Erro ao remover cliente
     */
    async deleteCliente(id) {
        if (!id) {
            throw new Error('ID do cliente é obrigatório')
        }

        try {
            const cliente = await this.getClienteById(id)
            if (!cliente) {
                throw new Error('Cliente não encontrado')
            }

            // Inativar usuário
            await this.usuarioService.inactivateUsuario(cliente.usuario.id, false)

            // Inativar empresa (se houver método para isso)
            // await this.empresaService.inactivateEmpresa(cliente.empresa.id)

            return { message: 'Cliente removido com sucesso' }

        } catch (error) {
            throw new Error(`Erro ao remover cliente: ${error.message}`)
        }
    }
}

module.exports = ClienteService 