'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Departamentos
 *   description: Endpoints para gerenciamento de departamentos
 */

Route.group(() => {
  /**
   * @swagger
   * /api/departamentos:
   *   get:
   *     tags:
   *       - Departamentos
   *     summary: Lista todos os departamentos ativos
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de departamentos retornada com sucesso
   *       400:
   *         description: Erro ao buscar departamentos
   *       401:
   *         description: Não autorizado
   */
  Route.get('/', 'Api/DepartamentoController.index')

  /**
   * @swagger
   * /api/departamentos/{id}:
   *   get:
   *     tags:
   *       - Departamentos
   *     summary: Busca um departamento específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID do departamento
   *     responses:
   *       200:
   *         description: Departamento encontrado com sucesso
   *       400:
   *         description: Erro ao buscar departamento
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Departamento não encontrado
   */
  Route.get('/:id', 'Api/DepartamentoController.show')

  /**
   * @swagger
   * /api/departamentos/filial/{filialId}:
   *   get:
   *     tags:
   *       - Departamentos
   *     summary: Lista departamentos por filial
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: filialId
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID da filial
   *     responses:
   *       200:
   *         description: Lista de departamentos da filial retornada com sucesso
   *       400:
   *         description: Erro ao buscar departamentos
   *       401:
   *         description: Não autorizado
   */
  Route.get('/filial/:filialId', 'Api/DepartamentoController.getByFilial')

  /**
   * @swagger
   * /api/departamentos:
   *   post:
   *     tags:
   *       - Departamentos
   *     summary: Cria um novo departamento
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             nome_departamento:
   *               type: string
   *               description: Nome do departamento
   *             filial_id:
   *               type: integer
   *               description: ID da filial
   *     responses:
   *       201:
   *         description: Departamento criado com sucesso
   *       400:
   *         description: Erro ao criar departamento
   *       401:
   *         description: Não autorizado
   */
  Route.post('/', 'Api/DepartamentoController.store')

  /**
   * @swagger
   * /api/departamentos/{id}:
   *   put:
   *     tags:
   *       - Departamentos
   *     summary: Atualiza um departamento existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID do departamento
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             nome_departamento:
   *               type: string
   *               description: Nome do departamento
   *             filial_id:
   *               type: integer
   *               description: ID da filial
   *     responses:
   *       200:
   *         description: Departamento atualizado com sucesso
   *       400:
   *         description: Erro ao atualizar departamento
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Departamento não encontrado
   */
  Route.put('/:id', 'Api/DepartamentoController.update')

  /**
   * @swagger
   * /api/departamentos/{id}:
   *   delete:
   *     tags:
   *       - Departamentos
   *     summary: Inativa um departamento
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID do departamento
   *     responses:
   *       200:
   *         description: Departamento inativado com sucesso
   *       400:
   *         description: Erro ao inativar departamento
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Departamento não encontrado
   */
  Route.delete('/:id', 'Api/DepartamentoController.destroy')

  /**
   * @swagger
   * /api/departamentos/{id}/status:
   *   put:
   *     tags:
   *       - Departamentos
   *     summary: Altera o status de um departamento
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID do departamento
   *     responses:
   *       200:
   *         description: Status do departamento atualizado com sucesso
   *       400:
   *         description: Erro ao atualizar status do departamento
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Departamento não encontrado
   */
  Route.put('/:id/status', 'Api/DepartamentoController.changeStatus')
})
.prefix('/api/departamentos')