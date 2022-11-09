import { Prisma } from '@twitch-apps/prisma'
import got from 'got'
import type { Client } from '../client.js'
import type { Message } from '../message.js'
import { BaseCommand } from '../utils/base-command.js'

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

export default class Balaboba extends BaseCommand {
  constructor(client: Client) {
    super(client, {
      name: 'balaboba',
      userlevel: 'everyone',
      examples: [
        'balaboba <query>',
        'balaboba <style> <query>',
        'balaboba styles',
        'balaboba tts'
      ]
    })

    this.getOptions().then((value) => {
      if (!value) {
        this.updateOptions({})
      }
    })
  }

  exec(...args: unknown[]): void {
    throw new Error('Method not implemented.')
  }

  async run(msg: Message, args: string[]) {
    if (args.length === 0) return

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

  replyStyles(msg: Message): void {
    const styles = Object.entries(BALABOBA_STYLES)
      .map(([styleId, description]) => `${styleId} — ${description}`)
      .join(', ')

    msg.reply(`[Balaboba] Стили: ${styles}`)
  }

  async toggleTextToSpeech(msg: Message) {
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
    await this.prisma.balaboba.upsert({
      where: { id: 1 },
      create: options,
      update: options
    })
  }

  async getOptions() {
    return await this.prisma.balaboba.findFirst({
      where: { id: 1 }
    })
  }
}
