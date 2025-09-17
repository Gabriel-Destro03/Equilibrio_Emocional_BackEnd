'use strict'

const UsuarioRepository = require('../Repositories/UsuarioRepository')
const AuthRepository = require('../Repositories/AuthRepository')

const UserRepository = require('../Repositories/UserRepository')

const FiliaisRepository = require('../Repositories/FilialRepository')
const DepartamentoRepository = require('../Repositories/DepartamentoRepository')
const UsuarioDepartamentoRepository = require('../Repositories/UsuarioDepartamentoRepository')
const UsuarioFilialRepository = require('../Repositories/UsuarioFilialRepository')

const PasswordGenerator = require('../Utils/PasswordGenerator')
const SendEmail = require('../Services/Emails/SendEmail')
const TokenService = require('./tokens/TokenService')
const crypto = require('crypto')

const ValidationHelper = require('../Helpers/ValidationHelper')
const PermissoesHelper = require('../Helpers/PermissoesHelper')

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository()
        this.usuarioRepository = new UserRepository()
        this.usuarioFilialRepository = new UsuarioFilialRepository()
        this.filiaisRepository = new FiliaisRepository()
        this.departamentoRepository = new DepartamentoRepository()
        this.usuarioDepartamentoRepository = new UsuarioDepartamentoRepository()
    }

    // =============================
    // 🔹 MÉTODOS DE BUSCA
    // =============================

    async getAllUsuarios() {
        try {
            return await this.repository.getAllUsuarios()
        } catch (error) {
            throw new Error(`Erro ao buscar usuários: ${error.message}`)
        }
    }

    async getUsuarioById(id) {
        ValidationHelper.requireField(id, 'ID do usuário é obrigatório')
        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) throw new Error('Usuário não encontrado')
            return usuario
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`)
        }
    }

    async getUsuarioByUid(uid) {
        ValidationHelper.requireField(uid, 'Uid do usuário é obrigatório')
        try {
            const usuario = await this.repository.getUsuarioByUid(uid)
            if (!usuario) throw new Error('Usuário não encontrado')
            return usuario
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`)
        }
    }

    async getUsuarioByEmail(email) {
        ValidationHelper.requireField(email, 'Email do usuário é obrigatório')
        try {
            const usuario = await this.repository.getUsuarioByEmail(email)
            if (!usuario) throw new Error('Usuário não encontrado')
            return usuario
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`)
        }
    }

    /**
     * Retorna usuários de uma empresa, aplicando filtro conforme permissões
     */
    async getUsuarioByEmpresaId(request) {
        const { empresa_id, uid, permissoes } = request.user

        ValidationHelper.requireField(empresa_id, 'Id da Empresa é obrigatório')

        // Valida se o usuário tem alguma permissão
        PermissoesHelper.validarPermissoes(permissoes, [
            PermissoesHelper.PERMISSOES.EMPRESA,
            PermissoesHelper.PERMISSOES.FILIAL,
            PermissoesHelper.PERMISSOES.DEPARTAMENTO
        ])
        const { isEmpresa, isFilial, isDepartamento } = PermissoesHelper.getNivelPermissao(permissoes)
        if (!isEmpresa && !isFilial && !isDepartamento) {
            throw new Error('Usuário não tem permissão para acessar esta funcionalidade')
        }

        try {
            let usuarios = await this.repository.getUsuariosByEmpresaId(empresa_id)
            const usuariosIds = usuarios.map(u => u.id)

            const filiais = await this.filiaisRepository.getFiliaisByEmpresaId(empresa_id)
            const filiaisIds = filiais.map(f => f.id)

            const usuariosFiliais = await this.repository.getUsuariosFiliais(usuariosIds)
            const departamentos = await this.departamentoRepository.getDepartamentosByFiliaisId(filiaisIds)

            // 🔹 FILTROS POR PERMISSÃO
            if(isEmpresa) {
                
            }else if (isFilial) {
                const usuarioFilial = await this.usuarioFilialRepository.getByUsuarioAndFilialByUid(uid)
                const idsPermitidos = new Set(usuarioFilial.map(u => u.id_filial))

                usuarios = usuarios.filter(usuario => {
                    const rel = usuariosFiliais.find(uf => uf.id_usuario === usuario.id && uf.status)
                    return rel && idsPermitidos.has(rel.id_filial)
                })
            }else if (isDepartamento) {
                const usuarioAtual = await this.repository.getUsuarioByUid(uid)
                if (!usuarioAtual) throw new Error('Usuário não encontrado')

                const usuarioDepartamentos = await this.usuarioDepartamentoRepository.getUsersByIds([usuarioAtual.id])
                const idsPermitidos = new Set(
                    usuarioDepartamentos.filter(ud => ud.status).map(ud => ud.id_departamento)
                )

                const usuariosDepartamentos = await this.usuarioDepartamentoRepository.getUsersByIds(usuariosIds)
                usuarios = usuarios.filter(usuario => {
                    const rel = usuariosDepartamentos.find(ud => ud.id_usuario === usuario.id && ud.status)
                    return rel && idsPermitidos.has(rel.id_departamento)
                })
            }

            // 🔹 FORMATAR RESULTADO
            const usuariosDepartamentos = await this.usuarioDepartamentoRepository.getUsersByIds(
                usuarios.map(u => u.id)
            )

            return usuarios.map(item => {
                const uf = usuariosFiliais
                    .filter(rel => rel.id_usuario === item.id && rel.status)
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]

                const ud = usuariosDepartamentos
                    .filter(rel => rel.id_usuario === item.id && rel.status)
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]

                const filial = filiais.find(f => f.id === uf?.id_filial)
                const departamento = departamentos.find(d => d.id === ud?.id_departamento)

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
        } catch (error) {
            throw new Error(`Erro ao buscar usuários: ${error.message}`)
        }
    }

    // =============================
    // 🔹 CRUD DE USUÁRIOS
    // =============================

    async createUsuario(data) {
        const { nome_completo, email, telefone, cargo, id_filial, id_departamento, empresa_id } = data

        ValidationHelper.requireField(nome_completo, 'Nome completo é obrigatório')
        ValidationHelper.requireField(email, 'Email é obrigatório')
        ValidationHelper.requireField(cargo, 'Cargo é obrigatório')
        ValidationHelper.ValidateEmail(email)
        ValidationHelper.ValidateTelefone(telefone)

        try {
            const usuarioExistente = await this.repository.getUsuarioByEmail(email)
            if (usuarioExistente) throw new Error('Já existe um usuário com este email')

            const password = PasswordGenerator.generatePassword()

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

            if (!usuario) throw new Error('Erro ao criar usuário: Dados não retornados')

            const code = crypto.randomBytes(4).toString('hex').toUpperCase()
            const token = TokenService.createToken({
                uid: usuario.uid,
                type: 'email_activation',
                code,
                status: true,
                expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }).token

            await this.usuarioRepository.saveUserAction({
                uid: password,
                type: 'email_activation',
                code,
                status: true,
                expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                token
            })

            const resetLink = `${process.env.VITE_URL_FRONT}/codigo?token=${token}`
            try {
                await SendEmail.sendWelcomeEmail(email, resetLink, code)
            } catch (err) {
                console.error('Erro ao enviar email de boas-vindas:', err)
            }

            return usuario
        } catch (error) {
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }

    async updateUsuario(id, data) {
        ValidationHelper.requireField(id, 'ID do usuário é obrigatório')

        const { nome_completo, email, telefone, cargo } = data
        if (!nome_completo && !email && !telefone && !cargo) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        if (email) ValidationHelper.ValidateEmail(email)
        if (telefone) ValidationHelper.ValidateTelefone(telefone)

        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) throw new Error('Usuário não encontrado')

            if (email && email !== usuario.email) {
                const usuarioExistente = await this.repository.getUsuarioByEmail(email)
                if (usuarioExistente) throw new Error('Já existe um usuário com este email')
            }

            return await this.repository.updateUsuario(id, data)
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário: ${error.message}`)
        }
    }

    async changeStatus(id, status) {
        ValidationHelper.requireField(id, 'ID do usuário é obrigatório')
        if (status === undefined || status === null) throw new Error('Status é obrigatório')

        try {
            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) throw new Error('Usuário não encontrado')

            return await this.repository.inactivateUsuario(id, status)
        } catch (error) {
            throw new Error(`Erro ao alterar status do usuário: ${error.message}`)
        }
    }

    async inactivateUsuario(id, status) {
        ValidationHelper.requireField(id, 'ID do usuário é obrigatório')
        try {
            return await this.repository.inactivateUsuario(id, status)
        } catch (error) {
            throw new Error(`Erro ao inativar usuário: ${error.message}`)
        }
    }

    // =============================
    // 🔹 USUÁRIOS POR FILIAL
    // =============================
    async getUsuariosByFilial(uid) {
        ValidationHelper.requireField(uid, 'ID do usuário é obrigatório')

        try {
            const PERMISSOES = {
                ADM: [7],
                FILIAL: [2, 5],
                DEPARTAMENTO: [3, 6]
            }

            const permissaoUser = await this.repository.getUserPermissions(uid)
            const permissoes = permissaoUser.map(p => p.permissoes) ?? []
            const possuiPermissao = ids => permissoes.some(p => ids.includes(p.id))

            const isAdm = possuiPermissao(PERMISSOES.ADM)
            const isFilial = possuiPermissao(PERMISSOES.FILIAL)
            const isDepartamento = possuiPermissao(PERMISSOES.DEPARTAMENTO)

            return await this.repository.getUsuariosByFilial(uid, isAdm, isFilial, isDepartamento)
        } catch (error) {
            throw new Error(`Erro ao buscar usuários da filial: ${error.message}`)
        }
    }
}

module.exports = UsuarioService