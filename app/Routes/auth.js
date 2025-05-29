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

}).prefix('/auth')
