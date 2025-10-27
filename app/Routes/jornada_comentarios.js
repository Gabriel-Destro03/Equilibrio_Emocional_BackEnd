'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Comentários de Jornadas
 *   description: Endpoints para buscar comentários dos questionários (emoção e reflexão) por departamento
 */

Route.group(() => {
    /**
     * @swagger
     * /api/jornadas/comentarios/departamento/{departamentoId}:
     *   get:
     *     tags:
     *       - Comentários de Jornadas
     *     summary: Busca comentários de jornadas por departamento
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: departamentoId
     *         in: path
     *         required: true
     *         type: integer
     *         description: ID do departamento
     *     responses:
     *       200:
     *         description: Comentários retornados com sucesso
     *         schema:
     *           type: object
     *           properties:
     *             departamento_id:
     *               type: integer
     *             departamento_nome:
     *               type: string
     *             total_comentarios:
     *               type: integer
     *             comentarios:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                   emocao:
     *                     type: string
     *                   reflexao:
     *                     type: string
     *                   uid:
     *                     type: string
     *                   created_at:
     *                     type: string
     *                     format: date-time
     *             data_busca:
     *               type: string
     *               format: date-time
     *       400:
     *         description: Erro ao buscar comentários
     *       401:
     *         description: Não autorizado
     */
    Route.get('/departamento/:departamentoId', 'Api/JornadaComentarioController.getByDepartamentoId')

    /**
     * @swagger
     * /api/jornadas/comentarios/departamento/{departamentoId}/filtrados:
     *   get:
     *     tags:
     *       - Comentários de Jornadas
     *     summary: Busca comentários de jornadas por departamento com filtros opcionais
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: departamentoId
     *         in: path
     *         required: true
     *         type: integer
     *         description: ID do departamento
     *       - name: data_inicio
     *         in: query
     *         required: false
     *         type: string
     *         format: date-time
     *         description: Data de início para filtrar comentários
     *       - name: data_fim
     *         in: query
     *         required: false
     *         type: string
     *         format: date-time
     *         description: Data de fim para filtrar comentários
     *       - name: limit
     *         in: query
     *         required: false
     *         type: integer
     *         description: Limite de resultados
     *       - name: offset
     *         in: query
     *         required: false
     *         type: integer
     *         description: Offset para paginação
     *     responses:
     *       200:
     *         description: Comentários filtrados retornados com sucesso
     *       400:
     *         description: Erro ao buscar comentários
     *       401:
     *         description: Não autorizado
     */
    Route.get('/departamento/:departamentoId/filtrados', 'Api/JornadaComentarioController.getByDepartamentoIdComFiltros')
})
.prefix('/api/jornadas/comentarios')

module.exports = Route

