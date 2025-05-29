'use strict'

const ChatMessageRepository = use('App/Repositories/ChatMessageRepository')

class ChatMessageService {
    constructor() {
        this.repository = new ChatMessageRepository()
    }

    async saveMessage(data) {
        return await this.repository.saveMessage(data)
    }
}

module.exports = ChatMessageService 