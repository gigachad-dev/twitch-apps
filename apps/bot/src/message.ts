import type { PrivateMessage } from '@twurple/chat/lib'
import type { Client } from './client.js'
import type { Commands } from './commands.js'

export class Message {
  constructor(
    public readonly commands: Commands,
    private readonly client: Client,
    private readonly msg: PrivateMessage,
    private readonly channel: string
  ) {}

  get userInfo() {
    return this.msg.userInfo
  }

  get currentChannel(): string {
    return this.channel
  }

  get messageId(): string {
    return this.msg.id
  }

  say(message: string) {
    this.client.irc.say(this.currentChannel, message)
  }

  reply(message: string) {
    this.client.irc.say(this.currentChannel, message, {
      replyTo: this.messageId
    })
  }

  action(message: string) {
    this.client.irc.action(this.currentChannel, message)
  }
}
