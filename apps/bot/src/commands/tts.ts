import { exec } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { type } from 'node:os'
import type { Prisma } from '@twitch-apps/prisma'
import type { Client } from '../client.js'
import type { Message } from '../message.js'
import { BaseCommand } from '../utils/base-command.js'

const UNIX_OPTIONS = {
  volume: 0.2,
  speed: 1.3,
  voice: 'random'
}

const UNIX_VOICES = [
  'kseniya',
  'xenia',
  'aidar',
  'baya',
  'eugene'
]

const INITIAL_OPTIONS: Record<string, Prisma.TextToSpeechCreateInput> = {
  Linux: UNIX_OPTIONS,
  Darwin: UNIX_OPTIONS,
  Windows_NT: {
    volume: 35,
    speed: 5,
    voice: 'Microsoft Irina Desktop'
  }
}

export default class TextToSpeech extends BaseCommand {
  private playing = false
  private queue: string[][] = []
  private soundQueue: ChildProcess[] = []

  constructor(client: Client) {
    super(client, {
      name: 't',
      description: 'Text to Speech',
      userlevel: 'everyone',
      aliases: ['ттс'],
      examples: [
        'tts tempo <temp>',
        'tts volume <volume>',
        'tts voices'
      ]
    })

    this.getOptions().then((value) => {
      const initialOptions = INITIAL_OPTIONS[type()]
      if (!value && initialOptions) {
        this.updateOptions(initialOptions)
      }
    })
  }

  async run(msg: Message, args: string[]): Promise<void> {
    if (args.length > 0) {
      if (msg.isBotOwner) {
        this.runManage(msg, args)
      } else if (
        msg.userInfo.isVip ||
        msg.userInfo.isSubscriber ||
        msg.userInfo.isMod
      ) {
        this.speech(args)
      } else {
        msg.reply('Text to Speech доступен только для Vips, Subs и Mods.')
      }
    } else {
      const options = await this.getOptions()
      if (!options) return
      const { speed, voice, volume } = options
      msg.reply(
        `${this.options.description}, volume: ${volume}, speed: ${speed}, voice: ${voice}`
      )
    }
  }

  async runManage(msg: Message, args: string[]) {
    switch (args[0]) {
      case 'skip': {
        if (!this.soundQueue.length) return
        const proc = this.soundQueue.shift()
        if (!proc) return
        proc.kill()
        break
      }
      case 'speed':
        this.updateSpeed(msg, args[1]!)
        break
      case 'volume':
        this.updateVolume(msg, args[1]!)
        break
      case 'help':
        msg.reply(`Доступные аргументы: !${this.options.examples!.join(', !')}`)
        break
      default:
        this.speech(args)
    }
  }

  async updateSpeed(msg: Message, arg: string) {
    try {
      const speed = Number(arg)

      if (isNaN(speed) && !isFinite(speed)) {
        throw new TypeError('Значение не является числом.')
      }

      if (speed > 10 || speed < 0.1) {
        throw new TypeError('Допустимые значения от 0.1 до 10.')
      }

      const options = await this.getOptions()
      if (!options) return
      await this.updateOptions({ ...options, speed })
      msg.reply('[TTS] Настройки обновлены.')
    } catch (err) {
      msg.reply((err as Error).message)
    }
  }

  async updateVolume(msg: Message, arg: string) {
    try {
      const volume = Number(arg)

      if (isNaN(volume) && !isFinite(volume)) {
        throw new TypeError('Значение не является числом.')
      }

      if (volume > 100 || volume < 0.1) {
        throw new TypeError('Допустимые значения от 0.1 до 100.')
      }

      const options = await this.getOptions()
      if (!options) return
      await this.updateOptions({ ...options, volume })
      msg.reply('[TTS] Настройки обновлены.')
    } catch (err) {
      msg.reply((err as Error).message)
    }
  }

  async speech(args: string[]) {
    const options = await this.getOptions()
    if (!options) return
    const { message, voice } = (() => {
      let voice = this.isUnix ? 'random' : options.voice
      let message = args.join(' ')

      if (this.isUnix) {
        if (UNIX_VOICES.includes(args[0]!)) {
          voice = args.shift()!
        }

        message = message.replace(/[^а-яА-Я ]/g, '')
      }

      return {
        message,
        voice
      }
    })()

    if (this.playing) {
      this.queue.push(args)
      return
    }

    this.playing = true
    const cmd = `docker run --rm -v /home/crashmax:/out tts ${voice} "${message}" tts.wav`

    exec(cmd, (err) => {
      if (err) {
        console.log(`[${this.constructor.name}] ${err}`)
        this.playing = false
        return
      }

      this.play()
    })
  }

  async play() {
    const options = await this.getOptions()
    if (!options) return
    const cmd = `play -v ${options.volume} ~/tts.wav tempo ${options.speed}`

    const nextTts = () => {
      this.playing = false

      if (this.queue.length) {
        const nextQueue = this.queue.shift()
        if (!nextQueue) return
        this.speech(nextQueue)
      }

      this.soundQueue.shift()
    }

    const proc = exec(cmd, (err) => {
      if (err) {
        console.log(`[TTS] ${err.message}`)
      }

      nextTts()
    })

    proc.on('close', () => {
      nextTts()
    })

    this.soundQueue.push(proc)
  }

  async getOptions() {
    return await this.prisma.textToSpeech.findFirst({
      where: { id: 1 }
    })
  }

  async updateOptions(options: Prisma.TextToSpeechCreateInput) {
    await this.prisma.textToSpeech.upsert({
      where: { id: 1 },
      create: options,
      update: options
    })
  }

  get isUnix() {
    const os = type()
    return os === 'Linux' || os === 'Darwin'
  }
}
