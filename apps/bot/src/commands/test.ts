import type { PrivateMessage } from '@twurple/chat/lib/index.js'
import type { Client } from '../client.js'
import { BaseCommand } from './base-command.js'

interface Args {
  num1: number
  num2: number
}

function toNumber(value: unknown) {
  const num = Number(value)
  return isNaN(num) ? null : num
}

export class Test extends BaseCommand {
  constructor(client: Client) {
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

  run(chat: PrivateMessage, { num1, num2 }: Args) {
    this.reply(`${num1}+${num2}=${num1 + num2}`)
  }
}
