'use strict'

const Route = use('Route')

Route.group('dashboard', () => {
    /**
 * @swagger
 * /dashboard/{uid}/{type}:
 *   get:
 *     operationId: dashboard-get-data
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - name: uid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da filial
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: type filtro
 *     responses:
 *       200:
 *         description: dashboard success
 *       401:
 *         description: Unauthorized
 */

    Route.post('dashboard', 'Api/DashboardController.getDashboardData')
    Route.post('tendencias', 'Api/DashboardController.getTendencias')
    Route.post('engajamento', 'Api/DashboardController.getEngajamento')

}).prefix('/dashboard')

module.exports = Route; 