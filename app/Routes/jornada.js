'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Jornadas
 *   description: Endpoints para gerenciamento de jornadas
 */

Route.group(() => {
    /**
     * @swagger
     * /api/jornadas:
     *   get:
     *     tags:
     *       - Jornadas
     *     summary: Lista todas as jornadas ativas
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de jornadas retornada com sucesso
     *       400:
     *         description: Erro ao buscar jornadas
     *       401:
     *         description: Não autorizado
     */
    Route.get('/', 'Api/JornadaController.index')

    /**
     * @swagger
     * /api/jornadas/{id}:
     *   get:
     *     tags:
     *       - Jornadas
     *     summary: Busca uma jornada específica
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: integer
     *         description: ID da jornada
     *     responses:
     *       200:
     *         description: Jornada encontrada com sucesso
     *       400:
     *         description: Erro ao buscar jornada
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Jornada não encontrada
     */
    Route.get('/:id', 'Api/JornadaController.show')

    /**
     * @swagger
     * /api/jornadas:
     *   post:
     *     tags:
     *       - Jornadas
     *     summary: Cria uma nova jornada
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: body
     *         in: body
     *         required: true
     *         schema:
     *           type: object
     *           properties:
     *             emocao:
     *               type: string
     *               description: Emoção da jornada
     *             reflexao:
     *               type: string
     *               description: Reflexão da jornada
     *             uid:
     *               type: string
     *               description: ID do usuário
     *             respostas:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_perguntas:
     *                     type: integer
     *                     description: ID da pergunta
     *                   id_resposta:
     *                     type: integer
     *                     description: ID da resposta
     *     responses:
     *       201:
     *         description: Jornada criada com sucesso
     *       400:
     *         description: Erro ao criar jornada
     *       401:
     *         description: Não autorizado
     */
    Route.post('/', 'Api/JornadaController.store')

    /**
     * @swagger
     * /api/jornadas/{id}:
     *   put:
     *     tags:
     *       - Jornadas
     *     summary: Atualiza uma jornada existente
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: integer
     *         description: ID da jornada
     *       - name: body
     *         in: body
     *         required: true
     *         schema:
     *           type: object
     *           properties:
     *             emocao:
     *               type: string
     *               description: Emoção da jornada
     *             reflexao:
     *               type: string
     *               description: Reflexão da jornada
     *             respostas:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_perguntas:
     *                     type: integer
     *                     description: ID da pergunta
     *                   id_resposta:
     *                     type: integer
     *                     description: ID da resposta
     *     responses:
     *       200:
     *         description: Jornada atualizada com sucesso
     *       400:
     *         description: Erro ao atualizar jornada
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Jornada não encontrada
     */
    Route.put('/:id', 'Api/JornadaController.update')
})
.prefix('/api/jornadas')