'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para gerenciamento de clientes
 */

Route.group(() => {
  /**
   * @swagger
   * /api/clientes:
   *   post:
   *     tags:
   *       - Clientes
   *     summary: Cadastra um novo cliente
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               usuario:
   *                 type: object
   *                 properties:
   *                   nome:
   *                     type: string
   *                     description: Nome do usuário
   *                   email:
   *                     type: string
   *                     description: Email do usuário
   *                   telefone:
   *                     type: string
   *                     description: Telefone do usuário
   *                   cargo:
   *                     type: string
   *                     description: Cargo do usuário
   *                   senha:
   *                     type: string
   *                     description: Senha do usuário
   *                   confirmarSenha:
   *                     type: string
   *                     description: Confirmação da senha
   *               empresa:
   *                 type: object
   *                 properties:
   *                   razaoSocial:
   *                     type: string
   *                     description: Razão social da empresa
   *                   cnpj:
   *                     type: string
   *                     description: CNPJ da empresa
   *     responses:
   *       201:
   *         description: Cliente cadastrado com sucesso
   *       400:
   *         description: Erro ao cadastrar cliente
   *       401:
   *         description: Não autorizado
   */
  Route.post('/', 'Api/ClienteController.store')

}).prefix('/api/clientes')