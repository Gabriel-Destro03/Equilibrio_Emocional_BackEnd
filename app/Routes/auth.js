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
   * /auth/validate-token:
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
  Route.post('/validate-token', 'Api/AuthController.validateResetToken')

  /**
   * @swagger
   * /auth/validate-code:
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
  Route.post('/validate-code', 'Api/AuthController.validateResetCode')

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

  /**
   * @swagger
   * /auth/define-password:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Define a senha do usuário
   *     description: Define a senha do usuário usando token, uid, código e senha
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
   *               - password
   *               - new_password
   *             properties:
   *               token:
   *                 type: string
   *                 description: Token de definição de senha
   *               uid:
   *                 type: string
   *                 description: ID do usuário
   *               code:
   *                 type: string
   *                 description: Código de definição de senha
   *               password:
   *                 type: string
   *                 description: Senha atual do usuário
   *               new_password:
   *                 type: string
   *                 description: Nova senha do usuário
   *     responses:
   *       200:
   *         description: Senha definida com sucesso
   *       400:
   *         description: Dados inválidos ou erro na definição
   */
  Route.post('/define-password', 'Api/AuthController.definePassword')

  /**
   * @swagger
   * /auth/active-user:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Cria um novo usuário no sistema de autenticação
   *     description: Cria um novo usuário no sistema de autenticação com validações de email, senha e verificação de usuário existente
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email do usuário
   *                 example: usuario@exemplo.com
   *               password:
   *                 type: string
   *                 description: Senha do usuário (mínimo 8 caracteres)
   *                 example: "12345678"
   *     responses:
   *       200:
   *         description: Usuário criado com sucesso
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
   *                   example: Usuário criado com sucesso
   *                 data:
   *                   type: object
   *                   description: Dados do usuário criado
   *       400:
   *         description: Dados inválidos
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
   *                   example: Email e senha são obrigatórios
   *       409:
   *         description: Usuário já existe
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
   *                   example: Usuário já existe no sistema
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
   *                   example: Erro ao criar usuário
   */
  Route.post('/active-user', 'Api/AuthController.activeUser')

  /**
   * @swagger
   * /auth/verify-access-code:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Verifica código de acesso do cliente
   *     description: Valida o código de acesso fornecido pelo cliente e ativa o usuário se correto
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *             properties:
   *               code:
   *                 type: string
   *                 description: Código de acesso do cliente
   *     responses:
   *       200:
   *         description: Código verificado com sucesso e usuário ativado
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
   *                   example: Código verificado com sucesso! Seu usuário foi ativado.
   *                 data:
   *                   type: object
   *                   description: Dados do usuário ativado
   *       400:
   *         description: Token ou código inválidos
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
   *                   example: Token ou código inválidos
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
   *                   example: Erro ao verificar código de acesso
   */
  Route.post('/verify-access-code', 'Api/AuthController.verifyAccessCode')

  /**
   * @swagger
   * /auth/resend-activation-email:
   *   post:
   *     operationId: auth-resend-activation-email
   *     tags:
   *       - Auth
   *     summary: Resend activation email for user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               uid:
   *                 type: string
   *                 required: true
   *                 description: User UID
   *     responses:
   *       200:
   *         description: Email sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     success:
   *                       type: boolean
   *                       example: true
   *                     message:
   *                       type: string
   *                       example: Email de ativação reenviado com sucesso
   *                     email:
   *                       type: string
   *                       example: user@example.com
   *       400:
   *         description: Bad request
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
   *                   example: UID do usuário é obrigatório
   *       404:
   *         description: Usuário não encontrado
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
   *                   example: Usuário não encontrado
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
   *                   example: Erro ao reenviar email de ativação
   */
  Route.post('/resend-activation-email', 'Api/AuthController.resendActivationEmail')

}).prefix('/auth')
