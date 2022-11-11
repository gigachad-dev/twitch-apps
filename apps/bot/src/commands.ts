import { readdir } from 'node:fs/promises'
import type { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage.js'
import { Client } from './client.js'
import { commandsPath } from './constants.js'
import { Message } from './message.js'

export interface ParsedMessage {
  command: string
  args: string[]
}

export type ArgumentValueType = string | number | boolean | null

export interface CommandArgs {
  name: string
  defaultValue?: ArgumentValueType
  transform: (value: ArgumentValueType) => ArgumentValueType
}

export class Commands {
  public readonly prefix = '!'
  private readonly commands: BaseCommand[] = []

  constructor(private readonly client: Client) {}

  async registerCommands(): Promise<void> {
    const paths = await readdir(commandsPath())
    for (const path of paths) {
      const { default: Command } = await import(commandsPath(path))
      if (Command.prototype instanceof BaseCommand) {
        const cmd: BaseCommand = new Command(this.client)
        console.log(`[commands]: ${cmd.options.name}`)
        this.commands.push(cmd)
      }
    }
  }

  private getCommand(commandName: string): BaseCommand<unknown> | undefined {
    return this.commands.find((command) => command.options.name === commandName)
  }

  private parseArguments<T extends Record<string, ArgumentValueType>>(
    args: string[],
    argsMap: CommandArgs[]
  ): T {
    return argsMap.reduce((acc, arg, key) => {
      const argValue = (args[key] ?? arg.defaultValue)!
      const transformedValue = arg.transform(argValue)
      // @ts-ignore
      acc[arg.name] = transformedValue ?? arg.defaultValue
      return acc
    }, {} as T)
  }

  parseMessage(message: string): ParsedMessage | null {
    const regex = new RegExp(`^(${this.prefix})([^\\s]+) ?(.*)`, 'gims')
    const matches = regex.exec(message)

    if (matches) {
      // const prefix = matches[1]
      const command = matches[2]!
      const result = {
        command: command,
        // prefix: prefix,
        args: [] as string[]
      }

      if (matches.length > 3) {
        result.args = matches[3]!
          .trim()
          .split(' ')
          .filter((v) => v !== '')
      }

      return result
    }

    return null
  }

  execCommand(commandName: string, ...args: any[]): void {
    const command = this.getCommand(commandName)

    if (command) {
      command.exec(...args)
    }
  }

  runCommand(
    parsedMessage: ParsedMessage,
    channel: string,
    msg: TwitchPrivateMessage
  ): void {
    const command = this.getCommand(parsedMessage.command)

    if (command) {
      const message = new Message(this, this.client, msg, channel)
      const args = command.options.args
        ? this.parseArguments(parsedMessage.args, command.options.args)
        : parsedMessage.args

      command.run(message, args)
    }
  }
}

/** BaseCommand */

enum UserLevel {
  everyone = 'everyone',
  subscriber = 'subscriber',
  moderator = 'moderator',
  vip = 'vip',
  regular = 'regular',
  streamer = 'streamer'
}

type UserLevels = keyof typeof UserLevel

interface CommandOptions {
  private?: boolean
  description?: string
  examples?: string[]
  name: string
  userlevel: UserLevels
  aliases?: string[]
  args?: CommandArgs[]
}

export abstract class BaseCommand<T = unknown> extends Client {
  constructor(
    private readonly client: Client,
    public readonly options: CommandOptions
  ) {
    super(client.irc, client.api, client.prisma)
  }

  abstract run(msg: Message, ...args: T[]): any
  abstract exec(...args: T[]): any
}
