import got from 'got'
import type { ChatMessage } from '../chat/chat-message.js'
import type { Client } from '../client.js'
import { randomInt } from '../helpers/random-int.js'
import { BaseCommand } from './model/base-command.js'
import type { CommandOptions } from './model/types.js'

export interface CatApiResponse {
  id: string
  created_at: string
  tags: string[]
  url: string
}

export default class Cat extends BaseCommand {
  constructor(client: Client, options: CommandOptions) {
    super(client, options)
  }

  exec(...args: unknown[]) {
    throw new Error('Method not implemented.')
  }

  async run(msg: ChatMessage): Promise<void> {
    try {
      const { body } = await got.get<CatApiResponse>(
        'https://cataas.com/cat?json=true',
        { responseType: 'json' }
      )

      const cats = [
        'CoolCat',
        'DxCat',
        'GlitchCat'
      ]
      const emote = cats[randomInt(0, cats.length - 1)]

      msg.reply(`${emote} cataas.com${body.url}`)
    } catch (err) {
      console.log(`[${this.constructor.name}] ${err}`)
    }
  }
}
