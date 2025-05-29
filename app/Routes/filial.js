'use strict'

const Route = use('Route')

/**
 * @swagger
 * tags:
 *   name: Filiais
 *   description: Endpoints para gerenciamento de filiais
 */

Route.group(() => {
  /**
   * @swagger
   * /api/filiais:
   *   get:
   *     tags:
   *       - Filiais
   *     summary: Lista todas as filiais ativas
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de filiais retornada com sucesso
   *       400:
   *         description: Erro ao buscar filiais
   *       401:
   *         description: Não autorizado
   */
  Route.get('/', 'Api/FilialController.index')

  /**
   * @swagger
   * /api/filiais/{id}:
   *   get:
   *     tags:
   *       - Filiais
   *     summary: Busca uma filial específica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID da filial
   *     responses:
   *       200:
   *         description: Filial encontrada com sucesso
   *       400:
   *         description: Erro ao buscar filial
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Filial não encontrada
   */
  Route.get('/:id', 'Api/FilialController.show')

  /**
   * @swagger
   * /api/filiais:
   *   post:
   *     tags:
   *       - Filiais
   *     summary: Cria uma nova filial
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             nome_filial:
   *               type: string
   *               description: Nome da filial
   *             cnpj:
   *               type: string
   *               description: CNPJ da filial
   *             endereco:
   *               type: string
   *               description: Endereço da filial
   *     responses:
   *       201:
   *         description: Filial criada com sucesso
   *       400:
   *         description: Erro ao criar filial
   *       401:
   *         description: Não autorizado
   */
  Route.post('/', 'Api/FilialController.store')

  /**
   * @swagger
   * /api/filiais/{id}:
   *   put:
   *     tags:
   *       - Filiais
   *     summary: Atualiza uma filial existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID da filial
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             nome_filial:
   *               type: string
   *               description: Nome da filial
   *             cnpj:
   *               type: string
   *               description: CNPJ da filial
   *             endereco:
   *               type: string
   *               description: Endereço da filial
   *     responses:
   *       200:
   *         description: Filial atualizada com sucesso
   *       400:
   *         description: Erro ao atualizar filial
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Filial não encontrada
   */
  Route.put('/:id', 'Api/FilialController.update')

  /**
   * @swagger
   * /api/filiais/{id}:
   *   delete:
   *     tags:
   *       - Filiais
   *     summary: Inativa uma filial
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *         description: ID da filial
   *     responses:
   *       200:
   *         description: Filial inativada com sucesso
   *       400:
   *         description: Erro ao inativar filial
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Filial não encontrada
   */
  Route.delete('/:id', 'Api/FilialController.destroy')
})
.prefix('/api/filiais')