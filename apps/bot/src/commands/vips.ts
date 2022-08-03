import { PrivateMessage } from '@twurple/chat/lib/index.js'
import { CoreClient } from '../core.js'
import { BaseCommand } from './base-command.js'

export class Vips extends BaseCommand<number> {
  constructor(client: CoreClient) {
    super(client, {
      name: 'test',
      userlevel: 'everyone',
      args: {
        defaultValue: 100,
        convert(value) {
          const num = Number(value)
          if (isNaN(num)) {
            return this.defaultValue!
          }

          return num
        }
      }
    })
  }

  execute(chat: PrivateMessage, args: string[]) {
    this.actionReply(`hello world ${args.join(' ')}`)
  }
}
