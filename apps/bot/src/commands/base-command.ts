import type { PrivateMessage } from '@twurple/chat/lib/index.js'
import { Api } from '../api.js'
import { Chat } from '../chat.js'
import { CoreClient } from '../core.js'

enum UserLevel {
  everyone = 'everyone',
  subscriber = 'subscriber',
  moderator = 'moderator',
  vip = 'vip',
  regular = 'regular',
  streamer = 'streamer'
}

type UserLevels = keyof typeof UserLevel

interface CommandArgs<T = string | number | boolean> {
  defaultValue?: T
  convert: (value: unknown) => T
}

export interface CommandOptions<T> {
  name: string
  userlevel: UserLevels
  aliases?: string[]
  args?: CommandArgs<T>
}

export abstract class BaseCommand<T, A = string[]> {
  private api: Api
  private chat: Chat

  constructor(
    private readonly client: CoreClient,
    public readonly options: CommandOptions<T>
  ) {
    this.api = client.api
    this.chat = client.chat
  }

  abstract execute(chat: PrivateMessage, args: A): Promise<void> | void

  reply(message: string) {
    this.chat.say(this.chat.currentNick, message)
  }

  actionReply(message: string) {
    this.chat.action(this.chat.currentNick, message)
  }
}
