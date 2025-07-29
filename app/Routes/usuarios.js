'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Endpoints para gerenciamento de usuários
 */

Route.group(() => {
  /**
   * @swagger
   * /api/usuarios:
   *   get:
   *     tags:
   *       - Usuários
   *     summary: Lista todos os usuários ativos
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de usuários retornada com sucesso
   *       400:
   *         description: Erro ao buscar usuários
   *       401:
   *         description: Não autorizado
   */
  Route.get('/', 'Api/UsuarioController.index')

  /**
   * @swagger
   * /api/usuarios/filial/{uid}:
   *   get:
   *     tags:
   *       - Usuários
   *     summary: Lista todos os usuários das filiais que o usuário tem acesso
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: uid
   *         in: path
   *         required: true
   *         type: string
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Lista de usuários retornada com sucesso
   *       400:
   *         description: Erro ao buscar usuários
   *       401:
   *         description: Não autorizado
   */
  Route.get('/filial/:uid', 'Api/UsuarioController.getUsuariosByFilial')

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   get:
   *     tags:
   *       - Usuários
   *     summary: Busca um usuário específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Usuário encontrado com sucesso
   *       400:
   *         description: Erro ao buscar usuário
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Usuário não encontrado
   */
  Route.get('/:id', 'Api/UsuarioController.show')
  
  /**
   * @swagger
   * /api/usuarios/uid/{uid}:
   *   get:
   *     tags:
   *       - Usuários
   *     summary: Busca um usuário específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: uid
   *         in: path
   *         required: true
   *         type: integer
   *         description: uid do usuário
   *     responses:
   *       200:
   *         description: Usuário encontrado com sucesso
   *       400:
   *         description: Erro ao buscar usuário
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Usuário não encontrado
   */
  Route.get('/uid/:uid', 'Api/UsuarioController.showUid')

  /**
   * @swagger
   * /api/usuarios/email/{email}:
   *   get:
   *     tags:
   *       - Usuários
   *     summary: Busca um usuário por email
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: email
   *         in: path
   *         required: true
   *         type: string
   *         description: Email do usuário
   *     responses:
   *       200:
   *         description: Usuário encontrado com sucesso
   *       400:
   *         description: Erro ao buscar usuário
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Usuário não encontrado
   */
  Route.get('/email/:email', 'Api/UsuarioController.getByEmail')
  Route.get('empresa/:empresa_id', 'Api/UsuarioController.getUsuarioByEmpresaId')
  
  /**
   * @swagger
   * /api/usuarios:
   *   post:
   *     tags:
   *       - Usuários
   *     summary: Cria um novo usuário
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             nome_completo:
   *               type: string
   *               description: Nome completo do usuário
   *             email:
   *               type: string
   *               description: Email do usuário
   *             telefone:
   *               type: string
   *               description: Telefone do usuário (apenas números)
   *             cargo:
   *               type: string
   *               description: Cargo do usuário
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *       400:
   *         description: Erro ao criar usuário
   *       401:
   *         description: Não autorizado
   */
  Route.post('/', 'Api/UsuarioController.store')

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   put:
   *     tags:
   *       - Usuários
   *     summary: Atualiza um usuário existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID do usuário
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             nome_completo:
   *               type: string
   *               description: Nome completo do usuário
   *             email:
   *               type: string
   *               description: Email do usuário
   *             telefone:
   *               type: string
   *               description: Telefone do usuário (apenas números)
   *             cargo:
   *               type: string
   *               description: Cargo do usuário
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso
   *       400:
   *         description: Erro ao atualizar usuário
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Usuário não encontrado
   */
  Route.put('/:id', 'Api/UsuarioController.update')

  /**
   * @swagger
   * /api/usuarios/{id}/status:
   *   put:
   *     tags:
   *       - Usuários
   *     summary: Altera o status de um usuário
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Status do usuário atualizado com sucesso
   *       400:
   *         description: Erro ao atualizar status do usuário
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Usuário não encontrado
   */
  Route.put('/:id/status', 'Api/UsuarioController.changeStatus')

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   delete:
   *     tags:
   *       - Usuários
   *     summary: Inativa um usuário
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Usuário inativado com sucesso
   *       400:
   *         description: Erro ao inativar usuário
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Usuário não encontrado
   */
  Route.delete('/:id', 'Api/UsuarioController.destroy')
})
.prefix('/api/usuarios')