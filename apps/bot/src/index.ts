import { AuthProvider } from '@twitch-apps/auth'
import { PrismaClient } from '@twitch-apps/prisma'
import { ChatClient } from '@twurple/chat'
import { config } from './config.js'

class Bot {
  private prismaClient: PrismaClient
  private authProvider: AuthProvider
  private chatClient: ChatClient

  constructor() { }

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
        scope: [
          'analytics:read:extensions',
          'user:edit',
          'user:read:email',
          'clips:edit',
          'bits:read',
          'analytics:read:games',
          'user:edit:broadcast',
          'user:read:broadcast',
          'chat:read',
          'chat:edit',
          'channel:moderate',
          'channel:read:subscriptions',
          'whispers:read',
          'whispers:edit',
          'moderation:read',
          'channel:read:redemptions',
          'channel:edit:commercial',
          'channel:read:hype_train',
          'channel:read:stream_key',
          'channel:manage:extensions',
          'channel:manage:broadcast',
          'user:edit:follows',
          'channel:manage:redemptions',
          'channel:read:editors',
          'channel:manage:videos',
          'user:read:blocked_users',
          'user:manage:blocked_users',
          'user:read:subscriptions',
          'user:read:follows',
          'channel:manage:polls',
          'channel:manage:predictions',
          'channel:read:polls',
          'channel:read:predictions',
          'moderator:manage:automod',
          'channel:manage:schedule',
          'channel:read:goals',
          'moderator:read:automod_settings',
          'moderator:manage:automod_settings',
          'moderator:manage:banned_users',
          'moderator:read:blocked_terms',
          'moderator:manage:blocked_terms',
          'moderator:read:chat_settings',
          'moderator:manage:chat_settings',
          'channel:manage:raids',
          'moderator:manage:announcements',
          'moderator:manage:chat_messages',
          'user:manage:chat_color',
          'channel:manage:moderators',
          'channel:read:vips',
          'channel:manage:vips',
          'user:manage:whispers'
        ]
      }
    })

    this.chatClient = new ChatClient({
      authProvider: this.authProvider,
      channels: ['vs_code']
    })

    this.chatClient.onMessage(async (channel, user, message, chat) => {
      if (message === '!vips') {
        const vips = await this.chatClient.getVips(channel)
        this.chatClient.say(channel, vips.join(', '))
      }

      console.log(`${user}: ${message}`)
    })

    await this.chatClient.connect()
  }
}

const bot = new Bot()
bot.connect()
