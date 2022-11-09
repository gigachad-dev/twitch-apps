import { readdir } from 'node:fs/promises'
import type { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage.js'
import type { Client } from './client.js'
import { commandsPath } from './constants.js'
import { Message } from './message.js'
import { BaseCommand } from './utils/base-command.js'
import { prepareArguments } from './utils/parse-arguments.js'

export interface ParsedMessage {
  command: string
  args: string[]
}

export class Commands {
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

  parseMessage(message: string): ParsedMessage | null {
    const regex = new RegExp('^(!)([^\\s]+) ?(.*)', 'gims')
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
    const command = this.commands.find(
      (command) => command.options.name === commandName
    )

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
        ? prepareArguments(parsedMessage.args, command.options.args!)
        : parsedMessage.args

      command.run(message, args)
    }
  }
}
