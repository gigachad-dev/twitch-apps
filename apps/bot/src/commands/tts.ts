// sudo dnf install sox
// docker pull ghcr.io/rprtr258/tts:latest
import { spawn } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { homedir, type } from 'node:os'
import type { Prisma } from '@twitch-apps/prisma'
import type { Client } from '../client.js'
import { BaseCommand, CommandsOptions } from '../commands.js'
import type { Message } from '../message.js'

const UNIX_OPTIONS = {
  volume: 0.2,
  speed: 1.3
}

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
  private playersQueue: ChildProcess[] = []

  constructor(client: Client, options: CommandsOptions) {
    super(client, options)

    this.getOptions().then((value) => {
      const initialOptions = INITIAL_OPTIONS[type()]
      if (!value && initialOptions) {
        this.updateOptions(initialOptions)
      }
    })
  }

  exec(args: string): void {
    this.speech([args])
  }

  async run(msg: Message, args: string[]): Promise<void> {
    if (args.length > 0) {
      if (msg.userInfo.isBroadcaster) {
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
        this.skipSpeech()
        break
      }
      case 'speed':
        this.updateSpeed(msg, args[1]!)
        break
      case 'volume':
        this.updateVolume(msg, args[1]!)
        break
      case 'help':
        msg.reply(`Доступные аргументы: FIXME`)
        break
      default:
        this.speech(args)
    }
  }

  skipSpeech() {
    if (!this.playersQueue.length) return
    const proc = this.playersQueue.shift()
    if (!proc) return
    proc.kill()
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

    if (this.playing) {
      this.queue.push(args)
      return
    }

    this.playing = true

    const message = args.join(' ')
    const docker = spawn('docker', [
      'run',
      '--rm',
      '-v',
      `${homedir()}:/out`,
      'ghcr.io/rprtr258/tts',
      message,
      'tts.mp3'
    ])

    docker.stderr.on('data', (err) => {
      if (err) {
        console.log(`[${this.constructor.name}] ${err}`)
        this.playing = false
      }
    })

    docker.on('close', (code) => {
      if (code === 0) {
        this.play()
      }
    })
  }

  async play() {
    const options = await this.getOptions()
    if (!options) return

    const nextTts = () => {
      this.playing = false

      if (this.queue.length) {
        const nextQueue = this.queue.shift()
        if (!nextQueue) return
        this.speech(nextQueue)
      }

      this.playersQueue.shift()
    }

    const player = spawn('play', [
      '-v',
      `${options.volume}`,
      `${homedir()}/tts.mp3`,
      'tempo',
      `${options.speed}`
    ])

    player.stderr.on('data', (err) => {
      console.log(`[TTS] ${err}`)
    })

    player.on('close', () => {
      nextTts()
    })

    this.playersQueue.push(player)
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

  get isWindows() {
    return type() === 'Windows_NT'
  }
}
