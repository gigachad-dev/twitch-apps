import type { PrivateMessage } from '@twurple/chat/lib'
import type { Client } from './client.js'

export class Message {
  constructor(
    private readonly client: Client,
    private readonly msg: PrivateMessage,
    private readonly channel: string
  ) {}

  get isBotOwner(): boolean {
    return this.name === this.client.irc.currentNick
  }

  get name(): string {
    return this.displayName.toLowerCase()
  }

  get displayName(): string {
    return this.msg.tags.get('display-name')!
  }

  get currentChannel(): string {
    return this.channel
  }

  reply(message: string) {
    this.client.irc.say(this.currentChannel, message)
  }

  actionReply(message: string) {
    this.client.irc.action(this.currentChannel, message)
  }
}
