import { AuthProvider } from '@twitch-apps/auth'
import { EventSub } from '@twitch-apps/eventsub'
import { IrcClient } from '@twitch-apps/irc'
import { PrismaClient } from '@twitch-apps/prisma'
import { PubSub } from '@twitch-apps/pubsub'
import { ApiClient } from '@twurple/api'
import { ClientCredentialsAuthProvider } from '@twurple/auth'
import { ChatUserstate } from '@twurple/auth-tmi/lib/index.js'
import { ChatMessage } from './chat/index.js'
import { ChatterState } from './chat/types.js'
import { Client } from './client.js'
import { Commands } from './commands/model/commands.js'
import { parseArgs, parseMessage } from './commands/model/index.js'
import { config } from './config.js'
import { scopes } from './constants.js'

export class Bot {
  private prismaClient: PrismaClient
  private authProvider: AuthProvider
  private ircClient: IrcClient
  private apiClient: ApiClient
  private botClient: Client
  private botCommands: Commands
  private pubsubClient: PubSub
  private eventsubClient: EventSub

  async connect(): Promise<void> {
    this.prismaClient = new PrismaClient()
    await this.prismaClient.$connect()

    const tokens = await AuthProvider.getTokens(this.prismaClient)
    this.authProvider = new AuthProvider({
      prismaClient: this.prismaClient,
      clientId: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      initialToken: tokens
        ? {
            ...tokens,
            obtainmentTimestamp: tokens.obtainmentTimestamp.getTime()
          }
        : {
            accessToken: config.ACCESS_TOKEN,
            refreshToken: config.REFRESH_TOKEN,
            expiresIn: 1,
            obtainmentTimestamp: 0,
            scope: scopes
          }
    })

    this.apiClient = new ApiClient({ authProvider: this.authProvider })
    const botInfo = await this.apiClient.users.getMe()

    this.eventsubClient = new EventSub({
      apiClient: new ApiClient({
        authProvider: new ClientCredentialsAuthProvider(
          config.CLIENT_ID,
          config.CLIENT_SECRET
        )
      }),
      strictHostCheck: true,
      secret: config.CLIENT_ID
    })

    await this.eventsubClient.listen()

    this.pubsubClient = new PubSub(this.authProvider)
    await this.pubsubClient.start()

    this.ircClient = new IrcClient(this.authProvider, botInfo.displayName)

    this.botClient = new Client(
      this.ircClient,
      this.apiClient,
      this.prismaClient,
      this.pubsubClient,
      this.eventsubClient
    )

    this.botCommands = new Commands(this.botClient)

    await this.ircClient.connect()

    this.ircClient.on('message', this.onMessage.bind(this))
  }

  private async onMessage(
    channel: string,
    userstate: ChatUserstate,
    messageText: string,
    self: boolean
  ): Promise<void> {
    if (self) return

    const chatter = { ...userstate, message: messageText } as ChatterState
    const msg = new ChatMessage(
      this.botClient,
      chatter,
      this.botCommands,
      channel
    )

    const parsedMessage = parseMessage(messageText)
    if (parsedMessage) {
      const command = this.botCommands.getRegisteredCommand(
        parsedMessage.command
      )
      if (command) {
        const isValidUserlevel = command.validateUserlevel(msg)
        if (typeof isValidUserlevel === 'string') {
          msg.reply(isValidUserlevel)
          return
        }

        const parsedArgs = parseArgs(command.options.args, parsedMessage.args)
        command.run(msg, parsedArgs ?? parsedMessage.args)
      }
    }
  }
}
