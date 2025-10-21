'use strict'

const IService = require('./IService')

/**
 * Interface para o service de relacionamento usuário-filial
 * Estende IService e adiciona métodos específicos
 */
class IUsuarioFilialService extends IService {
    /**
     * Busca representantes por filial
     * @param {Object} request - Request com dados do usuário
     * @param {number} idFilial - ID da filial
     * @returns {Promise<Array>} Lista de representantes
     */
    async getRepresentantesByFilial(request, idFilial) {
        throw new Error('Método getRepresentantesByFilial deve ser implementado')
    }

    /**
     * Atualiza relacionamento usuário-filial
     * @param {number} idUsuario - ID do usuário
     * @param {number} idFilial - ID da filial
     * @param {Object} updateData - Dados para atualização
     * @returns {Promise<Object>} Relacionamento atualizado
     */
    async updateUsuarioFilial(idUsuario, idFilial, updateData) {
        throw new Error('Método updateUsuarioFilial deve ser implementado')
    }

    /**
     * Remove relacionamento usuário-filial
     * @param {number} idUsuario - ID do usuário
     * @param {number} idFilial - ID da filial
     * @returns {Promise<void>}
     */
    async deleteUsuarioFilial(idUsuario, idFilial) {
        throw new Error('Método deleteUsuarioFilial deve ser implementado')
    }

    /**
     * Valida dados de relacionamento antes de criar/atualizar
     * @param {Object} relacionamentoData - Dados do relacionamento
     * @param {boolean} isUpdate - Se é uma atualização
     * @returns {Promise<void>}
     */
    async validateRelacionamentoData(relacionamentoData, isUpdate = false) {
        throw new Error('Método validateRelacionamentoData deve ser implementado')
    }

    /**
     * Gerencia permissões após mudança de representante
     * @param {number} idUsuario - ID do usuário
     * @param {Object} updateData - Dados da atualização
     * @returns {Promise<void>}
     */
    async manageRepresentativePermissions(idUsuario, updateData) {
        throw new Error('Método manageRepresentativePermissions deve ser implementado')
    }

    /**
     * Verifica e remove vínculos não representantes
     * @param {number} idUsuario - ID do usuário
     * @param {number} idFilial - ID da filial
     * @returns {Promise<void>}
     */
    async verificarEDeletarVinculoNaoRepresentante(idUsuario, idFilial) {
        throw new Error('Método verificarEDeletarVinculoNaoRepresentante deve ser implementado')
    }

    /**
     * Verifica se usuário pode ser representante da filial
     * @param {number} idUsuario - ID do usuário
     * @param {number} idFilial - ID da filial
     * @returns {Promise<boolean>} Se pode ser representante
     */
    async canBeRepresentative(idUsuario, idFilial) {
        throw new Error('Método canBeRepresentative deve ser implementado')
    }
}

module.exports = IUsuarioFilialService
