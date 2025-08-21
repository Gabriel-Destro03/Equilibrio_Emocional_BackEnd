'use strict'

const UsuarioRepository = require('../Repositories/UsuarioRepository')
const AuthRepository = require('../Repositories/AuthRepository')

const UserRepository = require('../Repositories/UserRepository')

const FiliaisRepository = require('../Repositories/FilialRepository')
const DepartamentoRepository = require('../Repositories/DepartamentoRepository')
const UsuarioDepartamentoRepository = require('../Repositories/UsuarioDepartamentoRepository')

const PasswordGenerator = require('../Utils/PasswordGenerator')
const SendEmail = require('../Services/Emails/SendEmail')
const TokenService = require('./tokens/TokenService')
const crypto = require('crypto')

/**
 * Serviço responsável pela lógica de negócios relacionada aos usuários
 */
class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository()
        this.usuarioRepository = new UserRepository()

        this.filiaisRepository = new FiliaisRepository()
        this.departamentoRepository = new DepartamentoRepository()

        this.usuarioDepartamentoRepository = new UsuarioDepartamentoRepository();
    }

    /**
     * Retorna todos os usuários ativos
     * @returns {Promise<Array>} Lista de usuários
     * @throws {Error} Erro ao buscar usuários
     */
    async getAllUsuarios() {
        try {
            return await this.repository.getAllUsuarios()
        } catch (error) {
            throw new Error(`Erro ao buscar usuários: ${error.message}`)
        }
    }

    /**
     * Busca um usuário pelo ID
     * @param {number} id - ID do usuário
     * @returns {Promise<Object>} Dados do usuário
     * @throws {Error} Erro ao buscar usuário ou usuário não encontrado
     */
    async getUsuarioById(id) {
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }

        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }
            return usuario
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`)
        }
    }

    async getUsuarioByUid(id) {
        if (!id) {
            throw new Error('Uid do usuário é obrigatório')
        }

        try {
            const usuario = await this.repository.getUsuarioByUid(id)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }
            return usuario
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`)
        }
    }

    async getUsuarioByEmpresaId(empresa_id) {
        if(!empresa_id) {
            throw new Error('Id da Empresa é obrigatório')
        }

        try {
            // 1. BUSCAR USUARIOS
            const usuarios = await this.repository.getUsuariosByEmpresaId(empresa_id);
            const usuariosIds = usuarios.map(u => u.id)
            // 2. BUSCAR USUARIOS_FILIAIS
            const usuarios_filias = await this.repository.getUsuariosFiliais(usuariosIds)
            // 3. BUSCAR FILIAIS
            const filiais = await this.filiaisRepository.getFiliaisByEmpresaId(empresa_id);
            const filiaisIds = filiais.map(f => f.id);

            // 4. BUSCAR DEPARTAMENTOS
            const departamentos = await this.departamentoRepository.getDepartamentosByFiliaisId(filiaisIds);
            const usuarios_departamentos = await this.usuarioDepartamentoRepository.getUsersByIds(usuariosIds)


            // 5. FORMATAR OBJETOS DE RESULTADO
            const usuariosFormatados = usuarios.map(item => {
                const usuarioRelacionamentoFilial = usuarios_filias?.filter(uf => uf?.id_usuario == item.id && uf.status === true)
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
                const usuarioRelacionamentoDepartamento = usuarios_departamentos?.filter(ud => ud?.id_usuario == item.id && ud.status === true)
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

                const filial = filiais?.filter(f => f.id == usuarioRelacionamentoFilial?.id_filial)[0];

                const departamento = departamentos
                    ?.filter(d => d.id == usuarioRelacionamentoDepartamento?.id_departamento)[0]

                return {
                    id: item.id,
                    uid: item.uid,
                    nome_completo: item.nome_completo,
                    cargo: item.cargo,
                    email: item.email,
                    telefone: item.telefone,
                    status: item.status,
                    created_at: item.created_at,
                    nome_filial: filial?.nome_filial || null,
                    id_filial: filial?.id || null,
                    departamento: departamento?.nome_departamento || null,
                    id_departamento: departamento?.id || null
                }
            })
            
            return usuariosFormatados;
        } catch (error) {
          throw new Error(`Erro ao buscar usuários: ${error.message}`)  
        }
    }

    /**
     * Busca um usuário pelo email
     * @param {string} email - Email do usuário
     * @returns {Promise<Object>} Dados do usuário
     * @throws {Error} Erro ao buscar usuário ou usuário não encontrado
     */
    async getUsuarioByEmail(email) {
        if (!email) {
            throw new Error('Email do usuário é obrigatório')
        }

        try {
            const usuario = await this.repository.getUsuarioByEmail(email)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }
            return usuario
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`)
        }
    }

    /**
     * Cria um novo usuário
     * @param {Object} usuarioData - Dados do usuário
     * @param {string} usuarioData.nome_completo - Nome completo do usuário
     * @param {string} usuarioData.email - Email do usuário
     * @param {string} usuarioData.telefone - Telefone do usuário
     * @param {string} usuarioData.cargo - Cargo do usuário
     * @returns {Promise<Object>} Dados do usuário criado
     * @throws {Error} Erro ao criar usuário ou dados inválidos
     */
    async createUsuario(usuarioData) {
        const { nome_completo, email, telefone, cargo, id_filial, id_departamento, empresa_id } = usuarioData


        if (!nome_completo || !email || !telefone || !cargo) {
            throw new Error('Todos os campos são obrigatórios')
        }

        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw new Error('Email inválido')
        }

        // Validação básica de telefone (aceita apenas números)
        const telefoneRegex = /^\d+$/
        if (!telefoneRegex.test(telefone)) {
            throw new Error('Telefone deve conter apenas números')
        }

        try {
            // Verifica se já existe um usuário com o mesmo email
            const usuarioExistente = await this.repository.getUsuarioByEmail(email)
            if (usuarioExistente) {
                throw new Error('Já existe um usuário com este email')
            }

            // Gera uma senha aleatória
            const password = PasswordGenerator.generatePassword()
            
            // // Cria o usuário no sistema de autenticação
            // const authUser = await this.authService.signUp(email, password)

            // if (!authUser || !authUser.user || !authUser.user.id) {
            //     throw new Error('Erro ao criar usuário no sistema de autenticação')
            // }

            // Cria o usuário no banco de dados
            const usuario = await this.repository.createUsuario({
                nome_completo,
                email,
                telefone,
                cargo,
                uid: password,
                empresa_id,
                id_filial,
                id_departamento
            })

            // Gerar código único para reset de senha
            const code = crypto.randomBytes(4).toString('hex').toUpperCase()
            
            const body = {
                uid: usuario.uid,
                type: "email_activation",
                code: code,
                status: true,
                expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
            }

            // Gerar token com os dados do body
            body.token = TokenService.createToken(body).token
            const resetLink = `${process.env.VITE_URL_FRONT}/codigo?token=${body.token}`

            // Salvar na tabela acoes_usuarios
            await this.usuarioRepository.saveUserAction({
                uid: password,
                type: 'email_activation',
                code: code,
                status: true,
                expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
                token: body.token
            })


            try {
                // Envia email de boas-vindas com a senha
                await SendEmail.sendWelcomeEmail(email, resetLink, code)
            } catch (emailError) {
                console.error('Erro ao enviar email de boas-vindas:', emailError)
                // Não interrompe o fluxo se o email falhar
            }

            if (!usuario) {
                console.error('Dados do usuário não retornados')
                throw new Error('Erro ao criar usuário: Dados não retornados')
            }

            return usuario
        } catch (error) {
            console.error('Erro na criação do usuário:', error)
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }

    /**
     * Atualiza um usuário existente
     * @param {number} id - ID do usuário
     * @param {Object} usuarioData - Dados do usuário para atualização
     * @param {string} [usuarioData.nome_completo] - Nome completo do usuário
     * @param {string} [usuarioData.email] - Email do usuário
     * @param {string} [usuarioData.telefone] - Telefone do usuário
     * @param {string} [usuarioData.cargo] - Cargo do usuário
     * @returns {Promise<Object>} Dados do usuário atualizado
     * @throws {Error} Erro ao atualizar usuário ou dados inválidos
     */
    async updateUsuario(id, usuarioData) {
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }

        const { nome_completo, email, telefone, cargo, id_filial, id_departamento } = usuarioData

        if (!nome_completo && !email && !telefone && !cargo) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        // Validação de email se fornecido
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                throw new Error('Email inválido')
            }
        }

        // Validação de telefone se fornecido
        if (telefone) {
            const telefoneRegex = /^\d+$/
            if (!telefoneRegex.test(telefone)) {
                throw new Error('Telefone deve conter apenas números')
            }
        }

        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            // Se estiver atualizando o email, verifica se já existe outro usuário com o mesmo email
            if (email && email !== usuario.email) {
                const usuarioExistente = await this.repository.getUsuarioByEmail(email)
                if (usuarioExistente) {
                    throw new Error('Já existe um usuário com este email')
                }
            }

            return await this.repository.updateUsuario(id, usuarioData)
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário: ${error.message}`)
        }
    }

    async changeStatus(id, status){
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }

        if (status === undefined || status === null) {
            throw new Error('Status é obrigatório')
        }

        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            return await this.repository.inactivateUsuario(id, status)
        } catch (error) {
            throw new Error(`Erro ao inativar usuário: ${error.message}`)
        }
    }

    /**
     * Inativa um usuário
     * @param {number} id - ID do usuário
     * @returns {Promise<Object>} Dados do usuário inativado
     * @throws {Error} Erro ao inativar usuário ou usuário não encontrado
     */
    async inactivateUsuario(id, status) {
        if (!id) {
            throw new Error('ID do usuário é obrigatório')
        }

        try {
            return await this.repository.inactivateUsuario(id, status)
        } catch (error) {
            throw new Error(`Erro ao inativar usuário: ${error.message}`)
        }
    }

    async getUsuariosByFilial(uid) {
        if (!uid) {
            throw new Error('ID do usuário é obrigatório')
        }

        try {
            const PERMISSOES = {
                ADM: [7],
                FILIAL: [2, 5],
                DEPARTAMENTO: [3, 6]
              };

            const permissaoUser = await this.repository.getUserPermissions(uid);
             
            const permissoes = permissaoUser.map(p => p.permissoes) ?? [];
            const possuiPermissao = (ids) =>
                permissoes.some(p => ids.includes(p.id));
            const isAdm = possuiPermissao(PERMISSOES.ADM);
            const isRepresentanteFilial = possuiPermissao(PERMISSOES.FILIAL);
            const isRepresentanteDepartamento = possuiPermissao(PERMISSOES.DEPARTAMENTO);
            return await this.repository.getUsuariosByFilial(uid, isAdm, isRepresentanteFilial,isRepresentanteDepartamento)
        } catch (error) {
            throw new Error(`Erro ao buscar usuários da filial: ${error.message}`)
        }
    }
}

module.exports = UsuarioService 