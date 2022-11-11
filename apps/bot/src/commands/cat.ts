import got from 'got'
import { Client } from '../client.js'
import { Message } from '../message.js'
import { BaseCommand } from '../utils/base-command.js'
import { randomInt } from '../utils/random-int.js'

export interface CatApiResponse {
  id: string
  created_at: string
  tags: string[]
  url: string
}

export default class Cat extends BaseCommand {
  constructor(client: Client) {
    super(client, {
      name: 'cat',
      userlevel: 'everyone',
      description: 'Случайная картинка котейки',
      aliases: ['кот']
    })
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
