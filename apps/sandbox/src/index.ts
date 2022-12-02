import { PrismaClient } from '@twitch-apps/prisma'
import { AuthProvider } from '@twitch-apps/auth'
import { ApiClient } from '@twurple/api'
import { Irc } from '@twitch-apps/irc'
import { cleanEnv, str } from 'envalid'
import 'dotenv/config'
import { scopes } from './constants.js'

export const config = cleanEnv(process.env, {
  CLIENT_ID: str(),
  CLIENT_SECRET: str(),
  ACCESS_TOKEN: str(),
  REFRESH_TOKEN: str()
})

const prismaClient = new PrismaClient()
await prismaClient.$connect()

const tokens = await AuthProvider.getTokens(prismaClient)
const authProvider = new AuthProvider({
  prismaClient,
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

const channels = await prismaClient.channel.findMany({
  where: {
    connected: true
  },
  select: {
    displayName: true
  }
})

const apiClient = new ApiClient({ authProvider })
const botInfo = await apiClient.users.getMe()

const ircClient = new Irc(
  authProvider,
  [botInfo.displayName, ...channels.map((v) => v.displayName)]
)

ircClient.onMessage((_, user, message) => console.log(`${user}: ${message}`))

await ircClient.connect()
