'use strict'

const Route = use('Route')

Route.group('', () => {

    /**
     * @swagger
     * /api/usuario-filial:
     *   get:
     *     tags:
     *       - Usuario Filial
     *     summary: Lista todos os usuários de uma filial
     *     responses:
     *       200:
     *         description: Lista de usuários
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_usuario:
     *                     type: integer
     *                   id_filial:
     *                     type: integer
     *                   is_representante:
     *                     type: boolean
     *       400:
     *         description: Erro ao buscar usuários
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    Route.get('', 'Api/UsuarioFilialController.index')

    /**
     * @swagger
     * /api/usuario-filial/representantes/{idFilial}:
     *   get:
     *     tags:
     *       - Usuario Filial
     *     summary: Lista os representantes de uma filial específica
     *     parameters:
     *       - name: idFilial
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da filial
     *     responses:
     *       200:
     *         description: Lista de representantes da filial
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_usuario:
     *                     type: integer
     *                   id_filial:
     *                     type: integer
     *                   is_representante:
     *                     type: boolean
     *       400:
     *         description: Erro ao buscar representantes
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    Route.get('/representantes/:idFilial', 'Api/UsuarioFilialController.getRepresentantesByFilial')

    /**
     * @swagger
     * /api/usuario-filial:
     *   post:
     *     tags:
     *       - Usuario Filial
     *     summary: Cria um novo usuário de filial
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_usuario:
     *                 type: integer
     *               id_filial:
     *                 type: integer
     *               is_representante:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: Usuário criado com sucesso
     *       400:
     *         description: Erro ao criar usuário
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    Route.post('', 'Api/UsuarioFilialController.store')

    /**
     * @swagger
     * /api/usuario-filial/{idUsuario}/{idFilial}:
     *   put:
     *     tags:
     *       - Usuario Filial
     *     summary: Atualiza um usuário de filial
     *     parameters:
     *       - name: idUsuario
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *       - name: idFilial
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_usuario:
     *                 type: integer
     *               id_filial:
     *                 type: integer
     *               is_representante:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: Usuário atualizado com sucesso
     *       400:
     *         description: Erro ao atualizar usuário
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    Route.put('', 'Api/UsuarioFilialController.update')

}).prefix('/api/usuario-filial') 