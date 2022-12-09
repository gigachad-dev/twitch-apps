import { CommandType } from '@twitch-apps/prisma'
import type { Client } from '../../client.js'
import { Balaboba } from '../balaboba.js'
import { Cat } from '../cat.js'
import { TextToSpeech } from '../tts.js'
import { BaseCommand } from './base-command.js'

export class Commands {
  private readonly commands: BaseCommand[] = []
  private readonly builtInCommands = [
    Balaboba,
    TextToSpeech,
    Cat
  ]

  constructor(private readonly client: Client) {
    this.initializeBuiltInCommands()
    this.registerCommands()
  }

  async registerCommands() {
    const commands = await this.client.prisma.command.findMany()

    for (const commandOptions of commands) {
      switch (commandOptions.commandType) {
        case 'custom':
          break
        case 'embedded':
          const EmbeddedCommand = this.getBuiltInCommand(commandOptions.name)
          if (EmbeddedCommand) {
            this.commands.push(
              new EmbeddedCommand(this.client, {
                ...commandOptions,
                args: EmbeddedCommand.defaultOptions.args
              })
            )
          }
          break
      }
    }
  }

  private async initializeBuiltInCommands(): Promise<void> {
    const countCommands = await this.client.prisma.command.count({
      where: {
        commandType: 'embedded'
      }
    })

    if (countCommands) return

    const embeddedCommands = this.builtInCommands.map((command) => ({
      ...command.defaultOptions,
      commandType: 'embedded' as CommandType
    }))

    await this.client.prisma.command.createMany({
      data: embeddedCommands
    })
  }

  getBuiltInCommand(commandName: string) {
    return this.builtInCommands.find(
      (command) => command.defaultOptions.name === commandName
    )
  }

  getRegisteredCommand(commandName: string): BaseCommand | undefined {
    return this.commands.find((command) => command.options.name === commandName)
  }

  execCommand(commandName: string, message: string): void {
    const command = this.getRegisteredCommand(commandName)
    if (command) {
      command.exec(message)
    }
  }
}
