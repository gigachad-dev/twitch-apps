import { readdir } from 'node:fs/promises'
import { Sendtype, Userlevel } from '@twitch-apps/prisma'
import type { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage.js'
import { Client } from './client.js'
import { commandsPath } from './constants.js'
import { Message } from './message.js'

export interface ParsedMessage {
  command: string
  args: string[]
}

export type CommandArgValue = string | number | boolean | null

export interface CommandArgs {
  name: string
  defaultValue?: CommandArgValue
  transform: (value: CommandArgValue) => CommandArgValue
}

const PREFIX = '!'

export class Commands {
  private readonly commands: BaseCommand[] = []
  private readonly commandsWithMessage = new Map<string, CommandWithMessage[]>()

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

  async registerCommandsWithMessage(): Promise<void> {
    const channels = await this.client.prisma.channel.findMany({
      select: {
        displayName: true,
        commands: {
          select: {
            name: true,
            message: true,
            userlevel: true,
            sendType: true
          }
        }
      },
      where: {
        connected: true
      }
    })

    for (const { displayName, commands } of channels) {
      const commandsWithMessage: CommandWithMessage[] = []

      for (const command of commands) {
        commandsWithMessage.push(
          new CommandWithMessage(this.client, {
            ...command,
            channel: displayName
          })
        )
      }

      this.commandsWithMessage.set(displayName, commandsWithMessage)
    }
  }

  private getCommand(commandName: string): BaseCommand<unknown> | undefined {
    return this.commands.find((command) => command.options.name === commandName)
  }

  static parseArguments<T extends Record<string, CommandArgValue>>(
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

  static parseMessage(message: string): ParsedMessage | null {
    const regex = new RegExp(`^(${PREFIX})([^\\s]+) ?(.*)`, 'gims')
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
        ? Commands.parseArguments(parsedMessage.args, command.options.args)
        : parsedMessage.args

      command.run(message, args)
    }
  }
}

/** BaseCommand */

interface CommandOptions {
  name: string
  userlevel: Userlevel[]
  description?: string
  examples?: string[]
  aliases?: string[]
  args?: CommandArgs[]
}

interface CommandWithMessageOptions extends CommandOptions {
  sendType: Sendtype
  message: string
  channel: string
}

export abstract class BaseCommand<T = unknown> extends Client {
  constructor(client: Client, public readonly options: CommandOptions) {
    super(client.irc, client.api, client.prisma)
  }

  abstract run(msg: Message, ...args: T[]): any
  abstract exec(...args: T[]): any
}

export class CommandWithMessage extends Client {
  constructor(
    client: Client,
    public readonly options: CommandWithMessageOptions
  ) {
    super(client.irc, client.api, client.prisma)
  }

  get channel() {
    return this.options.channel
  }

  get message() {
    return this.options.message
  }

  get sendType() {
    return this.options.sendType
  }

  exec() {
    const sendType = this.sendType === 'reply' ? 'say' : this.sendType
    switch (sendType) {
      case 'say':
        return this.irc.say(this.channel, this.message)
      case 'action':
        return this.irc.action(this.channel, this.message)
    }
  }

  run(msg: Message) {
    msg[this.sendType](this.message)
  }
}
