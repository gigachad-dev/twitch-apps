import type { IrcClient } from '@twitch-apps/irc'
import type { PrismaClient } from '@twitch-apps/prisma'
import type { ApiClient } from '@twurple/api/lib'

export class Client {
  constructor(
    public readonly irc: IrcClient,
    public readonly api: ApiClient,
    public readonly prisma: PrismaClient
  ) {}
}
