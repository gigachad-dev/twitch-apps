import type { EventSub } from '@twitch-apps/eventsub'
import type { IrcClient } from '@twitch-apps/irc'
import type { PrismaClient } from '@twitch-apps/prisma'
import type { PubSub } from '@twitch-apps/pubsub'
import type { ApiClient } from '@twurple/api/lib'

export class Client {
  constructor(
    public readonly irc: IrcClient,
    public readonly api: ApiClient,
    public readonly prisma: PrismaClient,
    public readonly pubsub: PubSub,
    public readonly eventsub: EventSub
  ) {}
}
