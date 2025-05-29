'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Respostas
 *   description: Endpoints para gerenciar respostas
 */

Route.group(() => {
    /**
     * @swagger
     * /api/respostas:
     *   get:
     *     summary: Lista todas as respostas ativas
     *     tags: [Respostas]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de respostas retornada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Resposta'
     *       400:
     *         description: Erro ao buscar respostas
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Não autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    Route.get('/', 'Api/RespostaController.index')

    /**
     * @swagger
     * /api/respostas/{id}:
     *   get:
     *     summary: Busca uma resposta pelo ID
     *     tags: [Respostas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da resposta
     *     responses:
     *       200:
     *         description: Dados da resposta retornados com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Resposta'
     *       400:
     *         description: Erro ao buscar resposta ou ID inválido
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Não autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Resposta não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    Route.get('/:id', 'Api/RespostaController.show')

    /**
     * @swagger
     * /api/respostas/pergunta/{perguntaId}:
     *   get:
     *     summary: Lista todas as respostas de uma pergunta específica
     *     tags: [Respostas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: perguntaId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da pergunta
     *     responses:
     *       200:
     *         description: Lista de respostas da pergunta retornada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Resposta'
     *       400:
     *         description: Erro ao buscar respostas ou ID inválido
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Não autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Pergunta não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    Route.get('/pergunta/:perguntaId', 'Api/RespostaController.getByPergunta')

    /**
     * @swagger
     * /api/respostas:
     *   post:
     *     summary: Cria uma nova resposta
     *     tags: [Respostas]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               descricao:
     *                 type: string
     *                 description: Descrição da resposta
     *                 example: 'Estou me sentindo muito bem hoje!'
     *               id_pergunta:
     *                 type: integer
     *                 description: ID da pergunta relacionada
     *                 example: 1
     *             required:
     *               - descricao
     *               - id_pergunta
     *     responses:
     *       201:
     *         description: Resposta criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Resposta'
     *       400:
     *         description: Dados inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Não autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    Route.post('/', 'Api/RespostaController.store')

    /**
     * @swagger
     * /api/respostas/{id}:
     *   put:
     *     summary: Atualiza uma resposta existente
     *     tags: [Respostas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da resposta
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               descricao:
     *                 type: string
     *                 description: Nova descrição da resposta
     *                 example: 'Estou me sentindo melhor agora'
     *               id_pergunta:
     *                 type: integer
     *                 description: Novo ID da pergunta relacionada
     *                 example: 2
     *               status:
     *                 type: boolean
     *                 description: Status ativo/inativo da resposta
     *                 example: true
     *     responses:
     *       200:
     *         description: Resposta atualizada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Resposta'
     *       400:
     *         description: Dados inválidos ou ID inválido
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Não autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Resposta não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    Route.put('/:id', 'Api/RespostaController.update')

    /**
     * @swagger
     * /api/respostas/{id}:
     *   delete:
     *     summary: Inativa uma resposta
     *     tags: [Respostas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da resposta
     *     responses:
     *       200:
     *         description: Resposta inativada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: 'Resposta inativada com sucesso'
     *       400:
     *         description: ID inválido
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Não autorizado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Resposta não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    Route.delete('/:id', 'Api/RespostaController.destroy')
}).prefix('/api/respostas') 