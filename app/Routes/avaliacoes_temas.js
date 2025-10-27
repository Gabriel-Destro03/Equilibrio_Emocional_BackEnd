'use strict'

const Route = use('Route')

Route.group('avaliacoes-temas', () => {
    /**
     * @swagger
     * /avaliacoes-temas:
     *   get:
     *     operationId: avaliacoes-temas-index
     *     tags:
     *       - Avaliações de Temas
     *     summary: Lista todas as avaliações de temas
     *     responses:
     *       200:
     *         description: Lista de avaliações de temas
     *       401:
     *         description: Unauthorized
     */
    Route.get('/', 'Api/AvaliacaoTemaController.index')

    /**
     * @swagger
     * /avaliacoes-temas/{id}:
     *   get:
     *     operationId: avaliacoes-temas-show
     *     tags:
     *       - Avaliações de Temas
     *     summary: Busca uma avaliação de tema específica
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da avaliação de tema
     *     responses:
     *       200:
     *         description: Avaliação de tema encontrada
     *       404:
     *         description: Avaliação não encontrada
     *       401:
     *         description: Unauthorized
     */
    Route.get('/:id', 'Api/AvaliacaoTemaController.show')

    /**
     * @swagger
     * /avaliacoes-temas/departamento/{departamentoId}:
     *   get:
     *     operationId: avaliacoes-temas-by-departamento
     *     tags:
     *       - Avaliações de Temas
     *     summary: Busca avaliações de temas por departamento
     *     parameters:
     *       - name: departamentoId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do departamento
     *     responses:
     *       200:
     *         description: Lista de avaliações de temas do departamento
     *       400:
     *         description: ID do departamento inválido
     *       401:
     *         description: Unauthorized
     */
    // Route.get('/departamento/:departamentoId', 'Api/AvaliacaoTemaController.getByDepartamentoId')

    /**
     * @swagger
     * /avaliacoes-temas/departamento/{departamentoId}/filtro-data:
     *   get:
     *     operationId: avaliacoes-temas-by-departamento-with-date-filter
     *     tags:
     *       - Avaliações de Temas
     *     summary: Busca avaliações de temas por departamento com filtro de data (mais de 5 dias) e integração n8n
     *     parameters:
     *       - name: departamentoId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do departamento
     *     responses:
     *       200:
     *         description: Lista de avaliações de temas do departamento com mais de 5 dias (integração n8n executada automaticamente)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 departamento_id:
     *                   type: integer
     *                 total_avaliacoes:
     *                   type: integer
     *                 filtro_aplicado:
     *                   type: boolean
     *                 n8n_atualizado:
     *                   type: boolean
     *                   description: Indica se a integração com n8n foi executada
     *                 filtro_data:
     *                   type: object
     *                   properties:
     *                     descricao:
     *                       type: string
     *                     data_limite:
     *                       type: string
     *                       format: date-time
     *                     avaliacoes_filtradas:
     *                       type: integer
     *                     integracao_n8n_executada:
     *                       type: boolean
     *                 avaliacoes:
     *                   type: array
     *                   items:
     *                     type: object
     *                 data_busca:
     *                   type: string
     *                   format: date-time
     *       400:
     *         description: ID do departamento inválido
     *       401:
     *         description: Unauthorized
     */
    Route.get('/departamento/:departamentoId', 'Api/AvaliacaoTemaController.getByDepartamentoIdWithDateFilter')

    /**
     * @swagger
     * /avaliacoes-temas/departamento/{departamentoId}/flexivel:
     *   post:
     *     operationId: avaliacoes-temas-by-departamento-flexible
     *     tags:
     *       - Avaliações de Temas
     *     summary: Busca avaliações de temas por departamento com opção de filtro de data
     *     parameters:
     *       - name: departamentoId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do departamento
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               aplicar_filtro_data:
     *                 type: boolean
     *                 description: Se deve aplicar filtro de data (mais de 5 dias) e executar integração n8n
     *                 default: false
     *     responses:
     *       200:
     *         description: Lista de avaliações de temas do departamento
     *       400:
     *         description: ID do departamento inválido
     *       401:
     *         description: Unauthorized
     */
    Route.post('/departamento/:departamentoId/flexivel', 'Api/AvaliacaoTemaController.getByDepartamentoIdFlexible')

    /**
     * @swagger
     * /avaliacoes-temas/departamento/{departamentoId}/forcar-n8n:
     *   post:
     *     operationId: avaliacoes-temas-forcar-n8n
     *     tags:
     *       - Avaliações de Temas
     *     summary: Força atualização de avaliações via integração n8n para um departamento
     *     parameters:
     *       - name: departamentoId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do departamento
     *     responses:
     *       200:
     *         description: Atualização via n8n executada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 departamento_id:
     *                   type: integer
     *                 status:
     *                   type: string
     *                 data_atualizacao:
     *                   type: string
     *                   format: date-time
     *                 resultado_n8n:
     *                   type: object
     *                   description: Resultado retornado pela integração n8n
     *                 tipo_operacao:
     *                   type: string
     *                   enum: [forcada]
     *       400:
     *         description: ID do departamento inválido ou erro na integração
     *       401:
     *         description: Unauthorized
     */
    Route.post('/departamento/:departamentoId/forcar-n8n', 'Api/AvaliacaoTemaController.forcarAtualizacaoN8n')

    /**
     * @swagger
     * /avaliacoes-temas:
     *   post:
     *     operationId: avaliacoes-temas-store
     *     tags:
     *       - Avaliações de Temas
     *     summary: Cria uma nova avaliação de tema
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - departamento_id
     *               - tema
     *               - avaliacao
     *             properties:
     *               departamento_id:
     *                 type: integer
     *                 description: ID do departamento
     *               tema:
     *                 type: string
     *                 description: Tema da avaliação
     *               avaliacao:
     *                 type: string
     *                 description: Avaliação do tema
     *               observacoes:
     *                 type: string
     *                 description: Observações adicionais
     *     responses:
     *       201:
     *         description: Avaliação de tema criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Unauthorized
     */
    Route.post('/', 'Api/AvaliacaoTemaController.store')

    /**
     * @swagger
     * /avaliacoes-temas/{id}:
     *   put:
     *     operationId: avaliacoes-temas-update
     *     tags:
     *       - Avaliações de Temas
     *     summary: Atualiza uma avaliação de tema existente
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da avaliação de tema
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               tema:
     *                 type: string
     *                 description: Tema da avaliação
     *               avaliacao:
     *                 type: string
     *                 description: Avaliação do tema
     *               observacoes:
     *                 type: string
     *                 description: Observações adicionais
     *     responses:
     *       200:
     *         description: Avaliação de tema atualizada com sucesso
     *       400:
     *         description: Dados inválidos
     *       404:
     *         description: Avaliação não encontrada
     *       401:
     *         description: Unauthorized
     */
    Route.put('/:id', 'Api/AvaliacaoTemaController.update')

    /**
     * @swagger
     * /avaliacoes-temas/{id}:
     *   delete:
     *     operationId: avaliacoes-temas-destroy
     *     tags:
     *       - Avaliações de Temas
     *     summary: Remove uma avaliação de tema
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da avaliação de tema
     *     responses:
     *       200:
     *         description: Avaliação de tema removida com sucesso
     *       404:
     *         description: Avaliação não encontrada
     *       401:
     *         description: Unauthorized
     */
    Route.delete('/:id', 'Api/AvaliacaoTemaController.destroy')

}).prefix('/api/avaliacoes-temas').middleware(['ensureJwt'])
