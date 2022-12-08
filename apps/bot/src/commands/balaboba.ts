import type { Prisma } from '@twitch-apps/prisma'
import got from 'got'
import type { ChatMessage } from '../chat/chat-message.js'
import type { Client } from '../client.js'
import {
  BaseCommand,
  CommandDefaultOptions,
  CommandOptions
} from './model/index.js'

interface BalabobaResponse {
  bad_query: number
  error: number
  is_cached?: number
  empty_zeliboba?: number
  intro?: number
  query: string
  text: string
  signature: string
}

const BALABOBA_STYLES = {
  0: 'Без стиля',
  1: 'Теории заговора',
  2: 'В-репортажи',
  3: 'Тосты',
  4: 'Пацанские цитаты',
  5: 'Рекламные слоганы',
  6: 'Короткие истории',
  7: 'Подписи в Instagram',
  8: 'Википедия',
  9: 'Синопсисы фильмов',
  10: 'Гороскоп',
  11: 'Народные мудрости',
  12: 'Произведения современного искусства',
  24: 'Инструкции по применению',
  25: 'Рецепты'
}

const BALABOBA_STYLES_ID = Object.keys(BALABOBA_STYLES)

export class Balaboba extends BaseCommand {
  static get defaultOptions(): CommandDefaultOptions {
    return {
      name: 'balaboba',
      userlevel: ['vip'],
      aliases: ['балабоба'],
      args: [],
      sendType: 'say',
      description: null
    }
  }

  constructor(client: Client, options: CommandOptions) {
    super(client, options)

    this.getOptions().then((value) => {
      if (!value) {
        this.updateOptions({})
      }
    })
  }

  exec(...args: unknown[]) {
    throw new Error('Method not implemented.')
  }

  async run(msg: ChatMessage, args: string[]) {
    if (args[0] === 'styles') {
      return this.replyStyles(msg)
    }

    if (args[0] === 'tts') {
      return this.toggleTextToSpeech(msg)
    }

    try {
      const intro = (() => {
        if (BALABOBA_STYLES_ID.includes(args[0]!)) {
          const style = Number(args[0])
          args.shift()
          return style
        } else {
          return 0
        }
      })()

      const query = args.join(' ')
      if (!query) {
        return msg.reply('Вы же ничего не написали')
      }

      const res = await got('https://yandex.ru/lab/api/yalm/text3', {
        method: 'POST',
        http2: true,
        json: {
          filter: 1,
          intro,
          query
        }
      }).json<BalabobaResponse>()

      if (res.bad_query > 0) {
        throw new Error('Балабоба не принимает запросы xdd')
      }

      const options = await this.getOptions()
      if (!options) return

      const message = `${intro === 8 ? query : ''} ${res.text}`

      if (options.tts) {
        msg.commands.execCommand('tts', message)
      } else {
        msg.reply(message)
      }
    } catch (err) {
      msg.reply((err as Error).message)
    }
  }

  replyStyles(msg: ChatMessage): void {
    const styles = Object.entries(BALABOBA_STYLES)
      .map(([styleId, description]) => `${styleId} — ${description}`)
      .join(', ')

    msg.reply(`[Balaboba] Стили: ${styles}`)
  }

  async toggleTextToSpeech(msg: ChatMessage) {
    const options = await this.getOptions()
    if (!options) return

    const toggledTts = !options.tts
    await this.updateOptions({
      tts: toggledTts
    })

    msg.reply(
      `[Balaboba] Text to Speech ${toggledTts ? 'включен' : 'выключен'}`
    )
  }

  async updateOptions(options: Prisma.BalabobaCreateInput) {
    await this.client.prisma.balaboba.upsert({
      where: { id: 1 },
      create: options,
      update: options
    })
  }

  async getOptions() {
    return await this.client.prisma.balaboba.findFirst({
      where: { id: 1 }
    })
  }
}
