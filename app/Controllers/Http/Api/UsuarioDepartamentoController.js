'use strict'

const UsuarioDepartamentoService = use('App/Services/UsuarioDepartamentoService')

class UsuarioDepartamentoController {
    constructor() {
        this.service = new UsuarioDepartamentoService()
    }

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
    async index({ response }) {
        try {
            const usuarioDepartamentos = await this.service.getAllUsuarioDepartamentos()
            return response.status(200).json(usuarioDepartamentos)
        } catch (error) {
            console.error('Erro no controller ao buscar usuario_departamento:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

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
    async getRepresentantesByDepartamento({ params, response }){
        try {
            const { idDepartamento } = params
            if (!idDepartamento) {
                return response.status(400).json({ error: 'ID do departamento é obrigatório nos parâmetros' })
            }
            const representantes = await this.service.getRepresentantesByDepartamento(idDepartamento)
            return response.status(200).json(representantes)
        } catch (error) {
            console.error('Erro no controller ao buscar usuario_departamento:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

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
    async store({ request, response }) {
        try {
            const usuarioDepartamentoData = request.only(['id_usuario', 'id_departamento', 'is_representante'])
            const usuarioDepartamento = await this.service.createUsuarioDepartamento(usuarioDepartamentoData)
            return response.status(201).json(usuarioDepartamento)
        } catch (error) {
             console.error('Erro no controller ao criar usuario_departamento:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

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
    async update({ request, response }) {
        try {
            const { id_usuario, id_departamento, is_representante } = request.only(['id_usuario', 'id_departamento', 'is_representante'])

            if (id_usuario === undefined || id_departamento === undefined || is_representante === undefined) {
                 return response.status(400).json({ error: 'id_usuario, id_departamento e is_representante são obrigatórios no corpo da requisição' })
            }

            const usuarioDepartamento = await this.service.updateUsuarioDepartamento(id_usuario, id_departamento, { is_representante })
            return response.status(200).json(usuarioDepartamento)
        } catch (error) {
            console.error('Erro no controller ao atualizar usuario_departamento:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

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
    async destroy({ params, response }) {
        try {
            const { idUsuario, idDepartamento } = params
            const result = await this.service.deleteUsuarioDepartamento(idUsuario, idDepartamento)
            return response.status(200).json(result)
        } catch (error) {
             console.error('Erro no controller ao deletar usuario_departamento:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = UsuarioDepartamentoController 