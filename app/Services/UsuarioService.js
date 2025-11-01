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
const IUsuarioService = require('../Interfaces/IUsuarioService')

class UsuarioService extends IUsuarioService {
    constructor() {
        super()
        this.repository = new UsuarioRepository()
        this.usuarioRepository = new UserRepository()
        this.usuarioFilialRepository = new UsuarioFilialRepository()
        this.filiaisRepository = new FiliaisRepository()
        this.departamentoRepository = new DepartamentoRepository()
        this.usuarioDepartamentoRepository = new UsuarioDepartamentoRepository()
    }

    // Implementação dos métodos da interface IService
    async getAll() {
        return this.getAllUsuarios()
    }

    async getById(id) {
        return this.getUsuarioById(id)
    }

    async create(data) {
        return this.createUsuario(data)
    }

    async update(id, data) {
        return this.updateUsuario(id, data)
    }

    async inactivate(id) {
        return this.inactivateUsuario(id, false)
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
     * Retorna usuários de uma empresa, aplicando filtro conforme permissões de representante
     */
    async getUsuarioByEmpresaId(request) {
        const { empresa_id, uid, permissoes } = request.user

        ValidationHelper.requireField(empresa_id, 'Id da Empresa é obrigatório')
        ValidationHelper.requireField(uid, 'UID é obrigatório')

        // Valida se o usuário tem alguma permissão de representante
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
            // Busca todos os usuários da empresa (base)
            let usuarios = await this.repository.getUsuariosByEmpresaId(empresa_id)
            
            // Busca dados relacionados
            const usuariosIds = usuarios.map(u => u.id)
            const filiais = await this.filiaisRepository.getFiliaisByEmpresaId(empresa_id)
            const filiaisIds = filiais.map(f => f.id)
            const usuariosFiliais = await this.repository.getUsuariosFiliais(usuariosIds)
            const departamentos = await this.departamentoRepository.getDepartamentosByFiliaisId(filiaisIds)

            // 🔹 FILTROS POR PERMISSÃO DE REPRESENTANTE
            if (isEmpresa) {
                // Representante de empresa: vê todos os usuários da empresa (sem filtro)
                // Não precisa filtrar nada
            } else if (isFilial) {
                // Representante de filial: vê apenas usuários das filiais que ele representa
                const usuarioAtual = await this.repository.getUsuarioByUid(uid)
                if (!usuarioAtual) throw new Error('Usuário não encontrado')

                // Busca filiais onde o usuário é representante
                const usuarioFiliais = await this.usuarioFilialRepository.getByUsuarioAndFilialByUid(uid)
                const idsFiliaisRepresentante = usuarioFiliais
                    .filter(uf => uf.is_representante && uf.status)
                    .map(uf => uf.id_filial)

                if (idsFiliaisRepresentante.length === 0) {
                    throw new Error('Usuário não é representante de nenhuma filial')
                }

                // Filtra usuários que estão nas filiais onde ele é representante
                usuarios = usuarios.filter(usuario => {
                    const rel = usuariosFiliais.find(uf => uf.id_usuario === usuario.id && uf.status)
                    return rel && idsFiliaisRepresentante.includes(rel.id_filial)
                })
            } else if (isDepartamento) {
                // Representante de departamento: vê apenas usuários dos departamentos que ele representa
                const usuarioAtual = await this.repository.getUsuarioByUid(uid)
                if (!usuarioAtual) throw new Error('Usuário não encontrado')

                // Busca departamentos onde o usuário é representante
                const usuarioDepartamentos = await this.usuarioDepartamentoRepository.getUsersByIds([usuarioAtual.id])
                const idsDepartamentosRepresentante = usuarioDepartamentos
                    .filter(ud => ud.is_representante && ud.status)
                    .map(ud => ud.id_departamento)

                if (idsDepartamentosRepresentante.length === 0) {
                    throw new Error('Usuário não é representante de nenhum departamento')
                }

                // Filtra usuários que estão nos departamentos onde ele é representante
                const usuariosDepartamentos = await this.usuarioDepartamentoRepository.getUsersByIds(usuariosIds)
                usuarios = usuarios.filter(usuario => {
                    const rel = usuariosDepartamentos.find(ud => ud.id_usuario === usuario.id && ud.status)
                    return rel && idsDepartamentosRepresentante.includes(rel.id_departamento)
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
        // Usa o método de validação da interface
        await this.validateUsuarioData(data, false)

        try {
            const password = await this.generateTemporaryPassword(data)

            const usuario = await this.repository.createUsuario({
                nome_completo: data.nome_completo,
                email: data.email,
                telefone: data.telefone,
                cargo: data.cargo,
                uid: password,
                empresa_id: data.empresa_id,
                id_filial: data.id_filial,
                id_departamento: data.id_departamento
            })

            if (!usuario) throw new Error('Erro ao criar usuário: Dados não retornados')

            // Usa o método da interface para criar token
            const tokenData = await this.createActivationToken(usuario)

            await this.usuarioRepository.saveUserAction({
                uid: password,
                type: 'email_activation',
                code: tokenData.code,
                status: true,
                expira_em: tokenData.expira_em,
                token: tokenData.token
            })

            const resetLink = `${process.env.VITE_URL_FRONT}/codigo?token=${tokenData.token}`
            try {
                await this.sendWelcomeEmail(data.email, resetLink, tokenData.code)
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

        // Verifica se pelo menos um campo foi fornecido para atualização
        if (data && Object.keys(data).length === 0) {
            throw new Error('Pelo menos um campo deve ser fornecido para atualização')
        }

        try {
            // Usa o método de validação da interface
            await this.validateUsuarioData(data, true)

            const usuario = await this.repository.getUsuarioById(id)
            if (!usuario) throw new Error('Usuário não encontrado')

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

            return await this.repository.inactivateUsuario(id, !status)
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
    async getUsuariosByFilial(request) {
        const { empresa_id, uid, permissoes } = request.user

        ValidationHelper.requireField(empresa_id, 'Id da Empresa é obrigatório')
        ValidationHelper.requireField(uid, 'UID é obrigatório')

        // Valida se o usuário tem alguma permissão de representante
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
            // Busca dados do usuário atual
            const usuarioAtual = await this.repository.getUsuarioByUid(uid)
            if (!usuarioAtual) throw new Error('Usuário não encontrado')

            // Busca todos os usuários com relacionamentos
            let usuarios = await this.repository.getUsuariosComRelacionamentos()

            // 🔹 FILTROS POR PERMISSÃO DE REPRESENTANTE
            if (isEmpresa) {
                // Representante de empresa: vê todos os usuários da empresa
                usuarios = usuarios.filter(u => u.empresa_id === empresa_id)
            } else if (isFilial) {
                // Representante de filial: vê apenas usuários das filiais que ele representa
                const usuarioFiliais = await this.usuarioFilialRepository.getByUsuarioAndFilialByUid(uid)
                const idsFiliaisRepresentante = usuarioFiliais
                    .filter(uf => uf.is_representante && uf.status)
                    .map(uf => uf.id_filial)

                if (idsFiliaisRepresentante.length === 0) {
                    throw new Error('Usuário não é representante de nenhuma filial')
                }

                // Filtra usuários das filiais onde ele é representante
                usuarios = usuarios.filter(u => {
                    const filialRel = u.usuario_filial?.find(uf => uf.status)
                    return filialRel && idsFiliaisRepresentante.includes(filialRel.id_filial)
                })
            } else if (isDepartamento) {
                // Representante de departamento: vê apenas usuários dos departamentos que ele representa
                const usuarioDepartamentos = await this.usuarioDepartamentoRepository.getUsersByIds([usuarioAtual.id])
                const idsDepartamentosRepresentante = usuarioDepartamentos
                    .filter(ud => ud.is_representante && ud.status)
                    .map(ud => ud.id_departamento)

                if (idsDepartamentosRepresentante.length === 0) {
                    throw new Error('Usuário não é representante de nenhum departamento')
                }

                // Filtra usuários dos departamentos onde ele é representante
                usuarios = usuarios.filter(u => {
                    const deptoRel = u.usuario_departamento?.find(ud => ud.status)
                    return deptoRel && idsDepartamentosRepresentante.includes(deptoRel.id_departamento)
                })
            }

            // 🔹 FORMATAR RESULTADO
            const usuariosFormatados = usuarios.map(u => {
                const filial = u.usuario_filial?.[0]?.filiais ?? {}
                const departamento = u.usuario_departamento?.[0]?.departamentos ?? {}

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
                }
            })

            // Ordena do mais recente para o mais antigo
            usuariosFormatados.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

            return usuariosFormatados
        } catch (error) {
            throw new Error(`Erro ao buscar usuários da filial: ${error.message}`)
        }
    }

    // Implementações dos métodos da interface IUsuarioService
    async getByUid(uid) {
        return this.getUsuarioByUid(uid)
    }

    async getByEmail(email) {
        return this.getUsuarioByEmail(email)
    }

    async getUsuariosByEmpresa(request) {
        return this.getUsuarioByEmpresaId(request)
    }

    async validateUsuarioData(usuarioData, isUpdate = false) {
        // Verifica se usuarioData foi fornecido
        if (!usuarioData) {
            throw new Error('Dados do usuário são obrigatórios')
        }

        if (!isUpdate) {
            ValidationHelper.requireField(usuarioData.nome_completo, 'Nome completo é obrigatório')
            ValidationHelper.requireField(usuarioData.email, 'Email é obrigatório')
            ValidationHelper.requireField(usuarioData.cargo, 'Cargo é obrigatório')
        }

        // Validação de campos opcionais apenas se fornecidos
        if (usuarioData.email && usuarioData.email.trim()) {
            ValidationHelper.validateEmail(usuarioData.email)
        }

        if (usuarioData.telefone && usuarioData.telefone.trim()) {
            ValidationHelper.validateTelefone(usuarioData.telefone)
        }

        // Verifica se email já existe (apenas para criação)
        if (usuarioData.email && !isUpdate) {
            const usuarioExistente = await this.repository.getUsuarioByEmail(usuarioData.email)
            if (usuarioExistente) {
                throw new Error('Já existe um usuário com este email')
            }
        }
    }

    async generateTemporaryPassword(usuarioData) {
        return PasswordGenerator.generatePassword()
    }

    async sendWelcomeEmail(email, resetLink, code) {
        try {
            await SendEmail.sendWelcomeEmail(email, resetLink, code)
        } catch (error) {
            console.error('Erro ao enviar email de boas-vindas:', error)
            throw new Error('Erro ao enviar email de boas-vindas')
        }
    }

    async createActivationToken(usuarioData) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase()
        const token = TokenService.createToken({
            uid: usuarioData.uid,
            type: 'email_activation',
            code,
            status: true,
            expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).token

        return {
            code,
            token,
            expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    }
}

module.exports = UsuarioService