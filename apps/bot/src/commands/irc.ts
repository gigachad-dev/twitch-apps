import type { HelixUser } from '@twurple/api/lib/index.js'
import type { Client } from '../client.js'
import type { Message } from '../message.js'
import { BaseCommand } from '../commands.js'
import type { CommandsOptions } from '../commands.js'

interface Args {
  action: 'join' | 'part'
  username: string
}

export default class Irc extends BaseCommand {
  constructor(client: Client, options: CommandsOptions) {
    super(client, options)
  }

  exec(...args: unknown[]) {
    throw new Error('Method not implemented.')
  }

  async run(msg: Message, { action, username }: Args) {
    if (msg.userInfo.isBroadcaster && username) {
      const channelName = username.startsWith('@') ? username.slice(1) : username
      const usernameInfo = await this.getUsernameInfo(channelName)
      if (!usernameInfo) return

      switch (action) {
        case 'join':
          return this.join(usernameInfo)
        case 'part':
          return this.part(usernameInfo)
        default:
      }
    }
  }

  private async getUsernameInfo(username: string) {
    return await this.api.users.getUserByName(username)
  }

  private async join({ displayName, id }: HelixUser): Promise<void> {
    try {
      await this.updateChannel({
        displayName,
        id
      })

      await this.irc.join(displayName)
    } catch (err) {
      console.log(err)
    }
  }

  async part({ displayName, id }: HelixUser): Promise<void> {
    await this.updateChannel({
      connected: false,
      displayName,
      id
    })

    this.irc.part(displayName)
  }

  async updateChannel(
    { displayName, connected, id }: { displayName: string, id: string, connected?: boolean }
  ): Promise<void> {
    try {
      const channelId = Number(id)
      await this.prisma.channel.upsert({
        where: {
          channelId
        },
        update: {
          connected,
          displayName
        },
        create: {
          channelId,
          displayName
        }
      })
    } catch (err) {
      console.log(err)
    }
  }
}
