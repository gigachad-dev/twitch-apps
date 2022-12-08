import { Userlevel } from '@twitch-apps/prisma'
import type { ChatMessage } from '../../chat/chat-message.js'
import type { Client } from '../../client.js'
import type { CommandOptions, NamedParameters } from './types.js'

export class BaseCommand {
  constructor(public client: Client, public options: CommandOptions) {}

  exec(...args: any[]): void {}

  async run(msg: ChatMessage, parameters: unknown): Promise<any> {}

  async prepareRun(msg: ChatMessage, parameters: string[]): Promise<any> {
    const namedParameters: NamedParameters = {}

    if (this.options.args && this.options.args.length > 0) {
      for (let i = 0; i < this.options.args.length; i++) {
        const args = this.options.args[i]!

        if (parameters[i]) {
          if (args.type) {
            namedParameters[args.name] = args.type(parameters[i])
          }

          if (args.prepare) {
            const preparedValue = args.prepare(
              namedParameters[args.name] || parameters[i]
            )

            if (preparedValue) {
              namedParameters[args.name] = preparedValue
            }
          }
        } else {
          if (args.defaultValue) {
            namedParameters[args.name] = args.defaultValue
          } else {
            namedParameters[args.name] = null
          }
        }
      }
    }

    await this.run(msg, namedParameters)
  }

  preValidate(msg: ChatMessage): string | boolean {
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
