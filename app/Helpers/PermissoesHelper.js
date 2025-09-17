'use strict'

class PermissoesHelper {
    static PERMISSOES = {
        EMPRESA: 'rep_empresa',
        FILIAL: 'rep_filial',
        DEPARTAMENTO: 'rep_departamento'
    }

    /**
     * Valida se o usuário possui pelo menos uma das permissões necessárias
     * @param {string[]} permissoes - Lista de permissões do usuário
     * @param {string[]} permissoesNecessarias - Permissões obrigatórias
     * @param {boolean} throwError - Se true, lança erro quando inválido
     */
    static validarPermissoes(permissoes, permissoesNecessarias = [], throwError = true) {
        const valido = permissoesNecessarias.some(perm => permissoes.includes(perm))
        if (!valido && throwError) {
            throw new Error('Usuário não tem permissão para acessar esta funcionalidade')
        }
        return valido
    }

    /**
     * Retorna o nível de acesso do usuário
     * @param {string[]} permissoes
     */
    static getNivelPermissao(permissoes) {
        return {
            isEmpresa: permissoes.includes(this.PERMISSOES.EMPRESA),
            isFilial: permissoes.includes(this.PERMISSOES.FILIAL),
            isDepartamento: permissoes.includes(this.PERMISSOES.DEPARTAMENTO)
        }
    }
}

module.exports = PermissoesHelper
