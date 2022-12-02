import got from 'got'
import { Client } from '../client.js'
import { BaseCommand } from '../commands.js'
import type { CommandsOptions } from '../commands.js'
import { randomInt } from '../helpers/random-int.js'
import { Message } from '../message.js'

export interface CatApiResponse {
  id: string
  created_at: string
  tags: string[]
  url: string
}

export default class Cat extends BaseCommand {
  constructor(client: Client, options: CommandsOptions) {
    super(client, options)
  }

  exec(...args: unknown[]) {
    throw new Error('Method not implemented.')
  }

  async run(msg: Message): Promise<void> {
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
