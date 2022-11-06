import { Client } from '../client.js'
import type { Message } from '../message.js'
import type { CommandArgs } from './parse-arguments.js'

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

  abstract run(msg: Message, ...args: T[]): Promise<void> | void
}
