import { PrivateMessage } from '@twurple/chat/lib/index.js'
import { CoreClient } from '../core.js'
import { ArgumentValueType, BaseCommand } from './base-command.js'

interface Args {
  num1: number
  num2: number
}

function toNumber(value: ArgumentValueType) {
  const num = Number(value)
  return isNaN(num) ? null : num
}

export class Vips extends BaseCommand<Args> {
  constructor(client: CoreClient) {
    super(client, {
      name: 'test',
      userlevel: 'everyone',
      args: [
        {
          name: 'num1',
          defaultValue: 0,
          transform: toNumber
        },
        {
          name: 'num2',
          defaultValue: 0,
          transform: toNumber
        }
      ]
    })
  }

  execute(chat: PrivateMessage, { num1, num2 }: Args) {
    this.reply(`${num1}+${num2}=${(num1 + num2).toFixed(2)}`)
  }
}
