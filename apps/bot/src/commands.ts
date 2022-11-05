import { readdir } from 'node:fs/promises'
import type { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage.js'
import { Client } from './client.js'
import { commandsPath } from './constants.js'
import { BaseCommand } from './utils/base-command.js'
import { prepareArguments } from './utils/parse-arguments.js'
import type { ParsedMessage } from './utils/parse-message.js'

export class Commands {
  private readonly commands: BaseCommand[] = []

  constructor(private readonly client: Client) {}

  async registerCommands(): Promise<void> {
    const paths = await readdir(commandsPath())
    for (const p of paths) {
      const { default: Command } = await import(commandsPath(p))
      if (Command.prototype instanceof BaseCommand) {
        const cmd: BaseCommand = new Command(this.client)
        this.commands.push(cmd)
      }
    }
  }

  private getCommand(commandName: string): BaseCommand<unknown> | undefined {
    return this.commands.find((command) => command.options.name === commandName)
  }

  runCommand(parsedMessage: ParsedMessage, msg: TwitchPrivateMessage): void {
    const command = this.getCommand(parsedMessage.command)
    if (command) {
      const args = prepareArguments(parsedMessage.args, command.options.args!)
      command.run(msg, args)
    }
  }
}
