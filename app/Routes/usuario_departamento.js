'use strict'

const Route = use('Route')

Route.group('', () => {
    /**
     * @swagger
     * /api/usuario-departamento:
     *   get:
     *     tags:
     *       - Usuario Departamento
     *     summary: Lista todas as associações usuário-departamento
     *     responses:
     *       200:
     *         description: Lista de associações usuário-departamento
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_usuario:
     *                     type: integer
     *                   id_departamento:
     *                     type: integer
     *                   is_representante:
     *                     type: boolean
     *       400:
     *         description: Erro ao buscar associações
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    Route.get('', 'Api/UsuarioDepartamentoController.index')

    /**
     * @swagger
     * /api/usuario-departamento/representantes/{idDepartamento}:
     *   get:
     *     tags:
     *       - Usuario Departamento
     *     summary: Lista os representantes de um departamento específico
     *     parameters:
     *       - name: idDepartamento
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do departamento
     *     responses:
     *       200:
     *         description: Lista de representantes do departamento
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_usuario:
     *                     type: integer
     *                   id_departamento:
     *                     type: integer
     *                   is_representante:
     *                     type: boolean
     *                   usuarios:
     *                     type: object
     *                     properties:
     *                       nome_completo:
     *                         type: string
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
    Route.get('/representantes/:idDepartamento', 'Api/UsuarioDepartamentoController.getRepresentantesByDepartamento')

    /**
     * @swagger
     * /api/usuario-departamento:
     *   post:
     *     tags:
     *       - Usuario Departamento
     *     summary: Cria uma nova associação usuário-departamento
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id_usuario
     *               - id_departamento
     *               - is_representante
     *             properties:
     *               id_usuario:
     *                 type: integer
     *               id_departamento:
     *                 type: integer
     *               is_representante:
     *                 type: boolean
     *     responses:
     *       201:
     *         description: Associação usuário-departamento criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id_usuario:
     *                   type: integer
     *                 id_departamento:
     *                   type: integer
     *                 is_representante:
     *                   type: boolean
     *       400:
     *         description: Dados inválidos ou associação já existente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    Route.post('', 'Api/UsuarioDepartamentoController.store')

    /**
     * @swagger
     * /api/usuario-departamento:
     *   put:
     *     tags:
     *       - Usuario Departamento
     *     summary: "Atualiza a associação usuário-departamento (ex: definir representante)"
     *     description: "Atualiza campos de uma associação existente entre usuário e departamento, como o status de representante."
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id_usuario
     *               - id_departamento
     *               - is_representante
     *             properties:
     *               id_usuario:
     *                 type: integer
     *               id_departamento:
     *                 type: integer
     *               is_representante:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: Associação usuário-departamento atualizada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id_usuario:
     *                   type: integer
     *                 id_departamento:
     *                   type: integer
     *                 is_representante:
     *                   type: boolean
     *       400:
     *         description: Dados inválidos ou associação não encontrada
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    Route.put('', 'Api/UsuarioDepartamentoController.update')

    /**
     * @swagger
     * /api/usuario-departamento/{idUsuario}/{idDepartamento}:
     *   delete:
     *     tags:
     *       - Usuario Departamento
     *     summary: Remove uma associação usuário-departamento
     *     parameters:
     *       - name: idUsuario
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do usuário
     *       - name: idDepartamento
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do departamento
     *     responses:
     *       200:
     *         description: Associação usuário-departamento removida com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *       400:
     *         description: Erro ao remover associação
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     */
    Route.delete('/:idUsuario/:idDepartamento', 'Api/UsuarioDepartamentoController.destroy')
}).prefix('/api/usuario-departamento') 