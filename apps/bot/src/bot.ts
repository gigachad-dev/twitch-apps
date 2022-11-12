import { AuthProvider } from '@twitch-apps/auth'
import { Irc } from '@twitch-apps/irc'
import { PrismaClient } from '@twitch-apps/prisma'
import { ApiClient } from '@twurple/api'
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage.js'
import { Api } from './api.js'
import { Client } from './client.js'
import { Commands } from './commands.js'
import { config } from './config.js'
import { scopes } from './constants.js'

export class Bot {
  private prismaClient: PrismaClient
  private authProvider: AuthProvider
  private ircClient: Irc
  private apiClient: ApiClient
  private commands: Commands
  private client: Client

  constructor() {}

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

    const channels = await this.prismaClient.channel.findMany({
      where: {
        connected: true
      },
      select: {
        displayName: true
      }
    })

    this.apiClient = new Api(this.authProvider)
    const { displayName } = await this.apiClient.users.getMe()
    this.ircClient = new Irc(this.authProvider, [
      displayName,
      ...channels.map((channel) => channel.displayName)
    ])

    this.client = new Client(this.ircClient, this.apiClient, this.prismaClient)
    this.commands = new Commands(this.client)

    this.ircClient.onMessage(this.onMessage.bind(this))
    this.ircClient.onJoin(this.onJoin.bind(this))
    this.ircClient.onPart(this.onPart.bind(this))

    await this.commands.registerCommands()
    await this.ircClient.connect()
  }

  private onMessage(
    channel: string,
    user: string,
    message: string,
    msg: TwitchPrivateMessage
  ): void {
    const parsedMessage = Commands.parseMessage(message)
    if (parsedMessage) {
      this.commands.runCommand(parsedMessage, channel, msg)
    }

    console.log(`${user}:`, message)
  }

  private onJoin(channel: string, user: string): void {
    console.log('onJoin:', { channel, user })
  }

  private onPart(channel: string, user: string): void {
    console.log('onPart:', { channel, user })
  }
}
