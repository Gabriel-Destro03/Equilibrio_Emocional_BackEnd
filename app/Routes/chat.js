'use strict'

const Route = use('Route')


Route.group('', () => {
    /**
 * @swagger
 * /api/chat:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Envia mensagem para a Clara (N8n) e retorna a resposta
 *     description: Envia uma mensagem do usuário para a IA, salva o histórico e retorna a resposta da IA.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - msg_user
 *               - uid
 *             properties:
 *               msg_user:
 *                 type: string
 *                 example: "Olá, Clara!"
 *               uid:
 *                 type: string
 *                 example: "12eb002e-ae81-472e-9943-12400883e6db"
 *     responses:
 *       200:
 *         description: Resposta da IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg_clara:
 *                   type: string
 *                   example: "Olá! Como posso te ajudar?"
 *       400:
 *         description: Dados obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "msg_user e uid são obrigatórios"
 *       500:
 *         description: Erro interno ao conversar com a IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro no chat com IA"
 */
    Route.post('', 'Api/ChatMessageController.converse') 
}).prefix('/api/chat')