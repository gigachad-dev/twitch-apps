import { AuthProvider } from '@twitch-apps/auth'
import { PrismaClient } from '@twitch-apps/prisma'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import { Api } from './api.js'
import { Chat } from './chat.js'
import { Client } from './client.js'
import { BaseCommand } from './commands/base-command.js'
import { Test } from './commands/test.js'
import { config } from './config.js'
import { scopes } from './constants.js'
import { prepareArguments } from './utils/parse-arguments.js'
import { parseMessage } from './utils/parse-message.js'

export class Bot {
  private prismaClient: PrismaClient
  private authProvider: AuthProvider
  private chatClient: ChatClient
  private apiClient: ApiClient
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
      initialToken: tokens ?? {
        accessToken: config.ACCESS_TOKEN,
        refreshToken: config.REFRESH_TOKEN,
        expiresIn: 1,
        obtainmentTimestamp: 0,
        scope: scopes
      }
    })

    this.apiClient = new Api(this.authProvider)
    this.chatClient = new Chat(this.authProvider, 'vs_code')
    this.client = new Client(this.chatClient, this.apiClient)

    const test: BaseCommand = new Test(this.client)

    this.chatClient.onMessage((channel, user, message, msg) => {
      const parsedMessage = parseMessage(message)

      if (parsedMessage) {
        if (parsedMessage.command === test.options.name) {
          const args = prepareArguments(parsedMessage.args, test.options.args!)
          test.run(msg, args)
        }
      }

      console.log(`${user}:`, message)
    })

    await this.chatClient.connect()
  }
}
