import got from 'got'
import type { ChatMessage } from '../chat/chat-message.js'
import type { Client } from '../client.js'
import { randomInt } from '../helpers/random-int.js'
import {
  BaseCommand,
  CommandDefaultOptions,
  CommandOptions
} from './model/index.js'

interface CatApiResponse {
  id: string
  created_at: string
  tags: string[]
  url: string
}

export class Cat extends BaseCommand {
  static get defaultOptions(): CommandDefaultOptions {
    return {
      name: 'cat',
      userlevel: ['everyone'],
      aliases: ['кот'],
      args: [],
      sendType: 'reply',
      description: null
    }
  }

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
