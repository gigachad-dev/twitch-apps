import { AuthProvider } from '@twitch-apps/auth'
import { PrismaClient } from '@twitch-apps/prisma'
import { ChatClient } from '@twurple/chat'
import { config } from './config.js'
import { scopes } from './constants/index.js'

import { Vips } from './commands/vips.js'

export class Bot {
  private prismaClient: PrismaClient
  private authProvider: AuthProvider
  public chatClient: ChatClient

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

    this.chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: ['vs_code']
    })

    const vips = new Vips(this.chatClient)

    this.chatClient.onMessage(async (channel, user, message, chat) => {
      if (vips.options.alias === message) {
        vips.execute(chat, channel)
      }
    })

    await this.chatClient.connect()
  }
}
