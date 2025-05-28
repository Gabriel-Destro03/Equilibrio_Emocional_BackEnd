const { SupabaseAuthService } = require('../Services/SupabaseAuthService')

const authService = new SupabaseAuthService()

/**
 * @swagger
 * /auth/users:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get all users
 *     description: Retrieve a list of all users from Supabase
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
module.exports = {
  async getUsers({ response }) {
    try {
      const users = await authService.getAllUsers()
      return response.json(users)
    } catch (error) {
      return response.status(500).json({ error: 'Failed to fetch users' })
    }
  },

  /**
   * @swagger
   * /auth/users/{id}:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Get user by ID
   *     description: Retrieve a specific user by their ID from Supabase
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     responses:
   *       200:
   *         description: User retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 email:
   *                   type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  async getUserById({ params, response }) {
    try {
      const user = await authService.getUserById(params.id)
      return response.json(user)
    } catch (error) {
      return response.status(500).json({ error: 'Failed to fetch user' })
    }
  }
} 