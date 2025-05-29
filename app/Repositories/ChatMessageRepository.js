'use strict'

const Config = use('Config')

class ChatMessageRepository {
    constructor() {
        this.supabase = Config.get('supabase').client
    }

    async saveMessage({ msg_user, msg_clara, uid }) {
        const { data, error } = await this.supabase
            .from('chat_messages')
            .insert([{ msg_user, msg_clara, uid }])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }
}

module.exports = ChatMessageRepository 