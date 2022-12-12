import { Userlevel } from '@twitch-apps/prisma'
import type { ChatMessage } from '../../chat/chat-message.js'
import type { Client } from '../../client.js'
import type { CommandOptions, CommandParsedArguments } from './types.js'

export abstract class BaseCommand {
  constructor(public client: Client, public options: CommandOptions) {}

  abstract exec(...args: string[]): void

  abstract run(
    msg: ChatMessage,
    args: string[] | CommandParsedArguments
  ): Promise<any>

  validateUserlevel(msg: ChatMessage): string | boolean {
    if (this.options.userlevel.includes(Userlevel.everyone)) {
      return true
    }

    let validationPassed = false

    if (msg.author.isBroadcaster) {
      validationPassed = true
    }

    if (msg.author.isModerator) {
      validationPassed = true
    }

    if (this.options.userlevel.includes(Userlevel.owner)) {
      if (this.client.irc.getUsername() !== msg.author.username) {
        return 'This command can be executed only from bot owners'
      }
    }

    if (this.options.userlevel.includes(Userlevel.subscriber)) {
      if (!validationPassed && !msg.author.isSubscriber) {
        return 'This command can be executed only from the subscribers'
      }
    }

    if (this.options.userlevel.includes(Userlevel.vip)) {
      if (!validationPassed && !msg.author.isVip) {
        return 'This command can be executed only from the vips'
      }
    }

    if (this.options.userlevel.includes(Userlevel.moderator)) {
      if (!validationPassed) {
        return 'This command can be executed only from the broadcaster'
      }
    }

    return true
  }
}
