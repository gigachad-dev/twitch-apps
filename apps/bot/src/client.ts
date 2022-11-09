import type { Irc } from '@twitch-apps/irc'
import type { PrismaClient } from '@twitch-apps/prisma'
import type { ApiClient } from '@twurple/api/lib'
import type { Commands } from './commands.js'

export class Client {
  constructor(
    public readonly irc: Irc,
    public readonly api: ApiClient,
    public readonly prisma: PrismaClient
  ) {}
}
