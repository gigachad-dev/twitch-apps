import { AuthProvider } from '@twitch-apps/auth'
import { PrismaClient } from '@twitch-apps/prisma'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage.js'
import { Api } from './api.js'
import { Chat } from './chat.js'
import { Client } from './client.js'
import { Commands } from './commands.js'
import { config } from './config.js'
import { scopes } from './constants.js'
import { parseMessage } from './utils/parse-message.js'

export class Bot {
  private prismaClient: PrismaClient
  private authProvider: AuthProvider
  private chatClient: ChatClient
  private apiClient: ApiClient
  private client: Client
  private commands: Commands

  constructor() {}

  async connect(): Promise<void> {
    this.prismaClient = new PrismaClient()
    await this.prismaClient.$connect()

    const tokens = await AuthProvider.getTokens(this.prismaClient)
    this.authProvider = new AuthProvider({
      prismaClient: this.prismaClient,
      clientId: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      initialToken: tokens ?? {
        accessToken: config.ACCESS_TOKEN,
        refreshToken: config.REFRESH_TOKEN,
        expiresIn: 1,
        obtainmentTimestamp: 0,
        scope: scopes
      }
    })

    this.apiClient = new Api(this.authProvider)
    this.chatClient = new Chat(this.authProvider, ['vs_code'])
    this.client = new Client(this.chatClient, this.apiClient)
    this.commands = new Commands(this.client)

    this.chatClient.onMessage(this.onMessage.bind(this))

    await this.commands.registerCommands()
    await this.chatClient.connect()
  }

  private onMessage(
    channel: string,
    user: string,
    message: string,
    msg: TwitchPrivateMessage
  ): void {
    const parsedMessage = parseMessage(message)
    if (parsedMessage) {
      this.commands.runCommand(parsedMessage, msg)
    }

    console.log(`${user}:`, message)
  }
}
