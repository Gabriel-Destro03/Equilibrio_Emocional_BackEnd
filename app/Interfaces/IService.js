'use strict'

/**
 * Interface base para todos os services
 * Define os métodos CRUD básicos que devem ser implementados
 */
class IService {
    /**
     * Busca todos os registros
     * @returns {Promise<Array>} Lista de registros
     */
    async getAll() {
        throw new Error('Método getAll deve ser implementado')
    }

    /**
     * Busca um registro por ID
     * @param {number|string} id - ID do registro
     * @returns {Promise<Object>} Registro encontrado
     */
    async getById(id) {
        throw new Error('Método getById deve ser implementado')
    }

    /**
     * Cria um novo registro
     * @param {Object} data - Dados do registro
     * @returns {Promise<Object>} Registro criado
     */
    async create(data) {
        throw new Error('Método create deve ser implementado')
    }

    /**
     * Atualiza um registro existente
     * @param {number|string} id - ID do registro
     * @param {Object} data - Dados para atualização
     * @returns {Promise<Object>} Registro atualizado
     */
    async update(id, data) {
        throw new Error('Método update deve ser implementado')
    }

    /**
     * Inativa um registro
     * @param {number|string} id - ID do registro
     * @returns {Promise<Object>} Registro inativado
     */
    async inactivate(id) {
        throw new Error('Método inactivate deve ser implementado')
    }

    /**
     * Altera o status de um registro
     * @param {number|string} id - ID do registro
     * @param {string|boolean} newStatus - Novo status
     * @returns {Promise<Object>} Registro com status alterado
     */
    async changeStatus(id, newStatus) {
        throw new Error('Método changeStatus deve ser implementado')
    }
}

module.exports = IService
