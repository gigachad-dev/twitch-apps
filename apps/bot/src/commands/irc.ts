import type { HelixUser } from '@twurple/api/lib/index.js'
import type { Client } from '../client.js'
import type { Message } from '../message.js'
import { BaseCommand } from '../utils/base-command.js'

interface Args {
  action: 'join' | 'part'
  username: string
}

export default class Irc extends BaseCommand {
  constructor(client: Client) {
    super(client, {
      name: 'irc',
      userlevel: 'everyone',
      args: [
        {
          name: 'action',
          defaultValue: 'join',
          transform(value) {
            return value === 'join' || value === 'part' ? value : null
          }
        },
        {
          name: 'username'
        }
      ]
    })
  }

  async run(msg: Message, { action, username }: Args) {
    if (msg.isBotOwner) {
      const usernameInfo = await this.getUsernameInfo(username)
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
      const channelId = Number(id)
      await this.prisma.connection.upsert({
        where: {
          channelId
        },
        update: {
          displayName
        },
        create: {
          channelId,
          displayName
        }
      })

      await this.irc.join(displayName)
    } catch (err) { }
  }

  async part({ displayName, id }: HelixUser): Promise<void> {
    try {
      await this.prisma.connection.delete({
        where: {
          channelId: Number(id)
        }
      })

      this.irc.part(displayName)
    } catch (err) { }
  }
}
