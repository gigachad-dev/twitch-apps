import type { Client } from '../client.js'
import type { Message } from '../message.js'
import { BaseCommand } from '../utils/base-command.js'

interface Args {
  num1: number
  num2: number
}

function toNumber(value: unknown) {
  const num = Number(value)
  return !isFinite(num) || isNaN(num) ? null : num
}

export default class Calc extends BaseCommand {
  constructor(client: Client) {
    super(client, {
      name: 'calc',
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

  run(msg: Message, { num1, num2 }: Args) {
    msg.reply(`${num1}+${num2}=${num1 + num2}`)
  }
}
