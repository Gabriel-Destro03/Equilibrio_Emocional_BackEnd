'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Perguntas
 *   description: Endpoints para gerenciar perguntas
 */

Route.group(() => {
    /**
     * @swagger
     * /api/perguntas:
     *   get:
     *     summary: Lista todas as perguntas ativas
     *     tags: [Perguntas]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de perguntas retornada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Pergunta'
     *       400:
     *         description: Erro ao buscar perguntas
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
    Route.get('/', 'Api/PerguntaController.index')

    /**
     * @swagger
     * /api/perguntas/{id}:
     *   get:
     *     summary: Busca uma pergunta pelo ID
     *     tags: [Perguntas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da pergunta
     *     responses:
     *       200:
     *         description: Dados da pergunta retornados com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Pergunta'
     *       400:
     *         description: Erro ao buscar pergunta ou ID inválido
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
    Route.get('/:id', 'Api/PerguntaController.show')

    /**
     * @swagger
     * /api/perguntas:
     *   post:
     *     summary: Cria uma nova pergunta
     *     tags: [Perguntas]
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
     *                 description: Descrição da pergunta
     *                 example: 'Qual é a sua emoção predominante hoje?'
     *               categoria:
     *                 type: string
     *                 description: Categoria da pergunta
     *                 example: 'Humor'
     *             required:
     *               - descricao
     *               - categoria
     *     responses:
     *       201:
     *         description: Pergunta criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Pergunta'
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
    Route.post('/', 'Api/PerguntaController.store')

    /**
     * @swagger
     * /api/perguntas/{id}:
     *   put:
     *     summary: Atualiza uma pergunta existente
     *     tags: [Perguntas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da pergunta
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               descricao:
     *                 type: string
     *                 description: Nova descrição da pergunta
     *                 example: 'Como você se sente hoje?'
     *               categoria:
     *                 type: string
     *                 description: Nova categoria da pergunta
     *                 example: 'Bem-estar'
     *               status:
     *                 type: boolean
     *                 description: Status ativo/inativo da pergunta
     *                 example: true
     *     responses:
     *       200:
     *         description: Pergunta atualizada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Pergunta'
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
     *         description: Pergunta não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    Route.put('/:id', 'Api/PerguntaController.update')

    /**
     * @swagger
     * /api/perguntas/{id}:
     *   delete:
     *     summary: Inativa uma pergunta
     *     tags: [Perguntas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da pergunta
     *     responses:
     *       200:
     *         description: Pergunta inativada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: 'Pergunta inativada com sucesso'
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
     *         description: Pergunta não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    Route.delete('/:id', 'Api/PerguntaController.destroy')
}).prefix('/api/perguntas') 