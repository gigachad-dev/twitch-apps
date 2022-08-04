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

export type ArgumentValueType = string | number | boolean | null

interface CommandArgs {
  name: string
  defaultValue?: ArgumentValueType
  transform: (value: ArgumentValueType) => ArgumentValueType
}

export interface CommandOptions {
  name: string
  userlevel: UserLevels
  aliases?: string[]
  args?: CommandArgs[]
}

export function prepareArguments<T extends Record<string, ArgumentValueType>>(
  args: string[],
  argsMap: CommandArgs[]
) {
  return argsMap.reduce((acc, arg, key) => {
    const argValue = (args[key] ?? arg.defaultValue)!
    const transformedValue = arg.transform(argValue)
    // @ts-ignore
    acc[arg.name] = transformedValue ?? arg.defaultValue
    return acc
  }, {} as T)
}

export abstract class BaseCommand<T> {
  private api: Api
  private chat: Chat

  constructor(
    private readonly client: CoreClient,
    public readonly options: CommandOptions
  ) {
    this.api = client.api
    this.chat = client.chat
  }

  abstract execute(chat: PrivateMessage, args: T): Promise<void> | void

  reply(message: string) {
    this.chat.say(this.chat.currentNick, message)
  }

  actionReply(message: string) {
    this.chat.action(this.chat.currentNick, message)
  }
}
