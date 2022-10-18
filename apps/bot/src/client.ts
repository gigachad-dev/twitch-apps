import type { ApiClient } from '@twurple/api/lib'
import type { ChatClient } from '@twurple/chat'

export class Client {
  constructor(
    public readonly chat: ChatClient,
    public readonly api: ApiClient
  ) {}

  reply(message: string) {
    this.chat.say(this.chat.currentNick, message)
  }

  actionReply(message: string) {
    this.chat.action(this.chat.currentNick, message)
  }
}
