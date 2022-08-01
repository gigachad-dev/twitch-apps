import { BaseCommand } from "./base-command"
import { ChatClient, PrivateMessage } from "@twurple/chat/lib/index.js"

export class Vips extends BaseCommand {
  constructor(
    private readonly chat: ChatClient
  ) {
    super({ alias: '!vips' })
  }

  async execute(chat: PrivateMessage, channel: string): Promise<void> {
    const vips = await this.chat.getVips(channel)
    this.chat.say(channel, vips.join(', '))
  }
}
