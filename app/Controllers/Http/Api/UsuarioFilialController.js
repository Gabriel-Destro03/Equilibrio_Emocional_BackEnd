'use strict'

const UsuarioFilialService = require('../../../Services/UsuarioFilialService')

class UsuarioFilialController {
    constructor() {
        this.service = new UsuarioFilialService()
    }

    /**
     * @swagger
     * /api/usuario-filial:
     *   get:
     *     tags:
     *       - Usuario Filial
     *     summary: Lista todas as associações usuário-filial
     *     responses:
     *       200:
     *         description: Lista de associações usuário-filial
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
            const usuarioFiliais = await this.service.getAllUsuarioFiliais()
            return response.status(200).json(usuarioFiliais)
        } catch (error) {
            console.error('Erro no controller ao buscar usuario_filial:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

    async getRepresentantesByFilial({ params, response }){
        try {
            const { idFilial } = params
            if (!idFilial) {
                return response.status(400).json({ error: 'ID da filial é obrigatório nos parâmetros' })
            }
            const representantes = await this.service.getRepresentantesByFilial(idFilial)
            return response.status(200).json(representantes)
        } catch (error) {
            console.error('Erro no controller ao buscar usuario_filial:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

    /**
     * @swagger
     * /api/usuario-filial:
     *   post:
     *     tags:
     *       - Usuario Filial
     *     summary: Cria uma nova associação usuário-filial
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id_usuario
     *               - id_filial
     *               - is_representante
     *             properties:
     *               id_usuario:
     *                 type: integer
     *               id_filial:
     *                 type: integer
     *               is_representante:
     *                 type: boolean
     *     responses:
     *       201:
     *         description: Associação usuário-filial criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id_usuario:
     *                   type: integer
     *                 id_filial:
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
            const usuarioFilialData = request.only(['id_usuario', 'id_filial', 'is_representante'])
            const usuarioFilial = await this.service.createUsuarioFilial(usuarioFilialData)
            return response.status(201).json(usuarioFilial)
        } catch (error) {
             console.error('Erro no controller ao criar usuario_filial:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

     /**
     * @swagger
     * /api/usuario-filial:
     *   put:
     *     tags:
     *       - Usuario Filial
     *     summary: "Atualiza a associação usuário-filial (ex: definir representante)"
     *     description: "Atualiza campos de uma associação existente entre usuário e filial, como o status de representante."
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id_usuario
     *               - id_filial
     *               - is_representante
     *             properties:
     *               id_usuario:
     *                 type: integer
     *               id_filial:
     *                 type: integer
     *               is_representante:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: Associação usuário-filial atualizada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id_usuario:
     *                   type: integer
     *                 id_filial:
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
            const { id_usuario, id_filial, is_representante } = request.only(['id_usuario', 'id_filial', 'is_representante'])

            // Ensure at least one field is being updated
            if (id_usuario === undefined || id_filial === undefined || is_representante === undefined) {
                 return response.status(400).json({ error: 'id_usuario, id_filial e is_representante são obrigatórios no corpo da requisição' })
            }

            const usuarioFilial = await this.service.updateUsuarioFilial(id_usuario, id_filial, { is_representante })
            return response.status(200).json(usuarioFilial)
        } catch (error) {
            console.error('Erro no controller ao atualizar usuario_filial:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }

     /**
     * @swagger
     * /api/usuario-filial/{idUsuario}/{idFilial}:
     *   delete:
     *     tags:
     *       - Usuario Filial
     *     summary: Remove uma associação usuário-filial
     *     parameters:
     *       - name: idUsuario
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do usuário
     *       - name: idFilial
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da filial
     *     responses:
     *       200:
     *         description: Associação usuário-filial removida com sucesso
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
            const { idUsuario, idFilial } = params
            const result = await this.service.deleteUsuarioFilial(idUsuario, idFilial)
            return response.status(200).json(result)
        } catch (error) {
             console.error('Erro no controller ao deletar usuario_filial:', error.message)
            return response.status(400).json({ error: error.message })
        }
    }
}

module.exports = UsuarioFilialController 