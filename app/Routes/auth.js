'use strict'

/*
|--------------------------------------------------------------------------
| Auth Routers
|--------------------------------------------------------------------------
|
*/

const Route = use('Route')

Route.group('auth', () => {
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     operationId: auth-login
   *     tags:
   *       - Auth
   *     summary: Login to the application
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 required: true
   *               password:
   *                 type: string
   *                 required: true
   *     responses:
   *       200:
   *         description: login success
   *       401:
   *         description: Unauthorized
   */
  Route.post('/login', 'Api/AuthController.login')

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     operationId: auth-logout
   *     tags:
   *       - Auth
   *     summary: Logout the application
   *     responses:
   *       200:
   *         description: logout success
   *       401:
   *         description: Unauthorized
   */
  Route.post('/logout', 'Api/AuthController.logout')

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     operationId: auth-refresh
   *     tags:
   *       - Auth
   *     summary: Refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refresh_token:
   *                 type: string
   *                 required: true
   *     responses:
   *       200:
   *         description: refresh success
   *       401:
   *         description: Unauthorized
   */
  Route.post('/refresh', 'Api/AuthController.refresh')

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Solicita redefinição de senha
   *     description: Envia um email com código de redefinição de senha para o usuário
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email do usuário
   *                 example: usuario@exemplo.com
   *     responses:
   *       200:
   *         description: Solicitação processada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Se o email existir em nossa base, você receberá as instruções para redefinir sua senha
   *       400:
   *         description: Email não fornecido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: Email é obrigatório
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: Erro ao processar solicitação de redefinição de senha
   */
  Route.post('/forgot-password', 'Api/AuthController.forgotPassword')

  /**
   * @swagger
   * /auth/validate-reset-token:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Valida token de redefinição de senha
   *     description: Verifica se o token de redefinição de senha é válido e não está expirado
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *             properties:
   *               token:
   *                 type: string
   *                 description: Token de redefinição de senha
   *     responses:
   *       200:
   *         description: Token válido
   *       400:
   *         description: Token inválido ou expirado
   */
  Route.post('/validate-reset-token', 'Api/AuthController.validateResetToken')

  /**
   * @swagger
   * /auth/validate-reset-code:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Valida token e código de redefinição de senha
   *     description: Verifica se o token e código de redefinição de senha são válidos
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - code
   *             properties:
   *               token:
   *                 type: string
   *                 description: Token de redefinição de senha
   *               code:
   *                 type: string
   *                 description: Código de redefinição de senha
   *     responses:
   *       200:
   *         description: Token e código válidos
   *       400:
   *         description: Token ou código inválidos
   */
  Route.post('/validate-reset-code', 'Api/AuthController.validateResetCode')

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Atualiza a senha do usuário
   *     description: Valida token, uid e código, e atualiza a senha do usuário
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - uid
   *               - code
   *               - new_password
   *             properties:
   *               token:
   *                 type: string
   *                 description: Token de redefinição de senha
   *               uid:
   *                 type: string
   *                 description: ID do usuário
   *               code:
   *                 type: string
   *                 description: Código de redefinição de senha
   *               new_password:
   *                 type: string
   *                 description: Nova senha do usuário
   *     responses:
   *       200:
   *         description: Senha atualizada com sucesso
   *       400:
   *         description: Dados inválidos ou erro na atualização
   */
  Route.post('/reset-password', 'Api/AuthController.resetPassword')

}).prefix('/auth')
