'use strict'

const ChatMessageService = use('App/Services/ChatMessageService')
const N8nClient = use('App/Services/n8n/N8nClient')

class ChatMessageController {
    constructor() {
        this.service = new ChatMessageService()
        this.n8nClient = new N8nClient()
    }

    async converse({ request, response }) {
        try {
            const { msg_user, uid } = request.only(['msg_user', 'uid'])
            if (!msg_user || !uid) {
                return response.status(400).json({ error: 'msg_user e uid são obrigatórios' })
            }

            // Envia para o agente de IA
            const msg_clara = await this.n8nClient.sendMessageToClara(msg_user, uid)

            // Salva no banco
            await this.service.saveMessage({ msg_user, msg_clara, uid })

            // Retorna a resposta da IA
            return response.status(200).json({ msg_clara })
        } catch (error) {
            console.error('Erro no chat com IA:', error)
            return response.status(500).json({ error: error.message })
        }
    }
}

module.exports = ChatMessageController 