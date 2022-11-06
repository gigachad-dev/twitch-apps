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
        'balaboba styles'
      ]
    })
  }

  async run(msg: Message, args: string[]) {
    if (args.length === 0) return

    if (args[0] === 'styles') {
      return this.replyStyles(msg)
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

      msg.reply(`-> ${res.text}`)
    } catch (err) {
      msg.reply((err as Error).message)
    }
  }

  replyStyles(msg: Message): void {
    const styles = Object.entries(BALABOBA_STYLES)
      .map(([styleId, description]) => `${styleId} — ${description}`)
      .join(', ')

    msg.reply(`Стили БАЛАБОБЫ: ${styles}`)
  }
}
