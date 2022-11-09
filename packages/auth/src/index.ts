import type { Auth, PrismaClient } from '@twitch-apps/prisma'
import { RefreshingAuthProvider } from '@twurple/auth'
import type { AccessToken } from '@twurple/auth'

interface AuthProviderOpts {
  clientId: string
  clientSecret: string
  initialToken: AccessToken
  prismaClient: PrismaClient
}

export class AuthProvider extends RefreshingAuthProvider {
  private readonly prisma: PrismaClient

  constructor({
    clientId,
    clientSecret,
    initialToken,
    prismaClient
  }: AuthProviderOpts) {
    super(
      {
        clientId,
        clientSecret,
        onRefresh: (token) => this.onRefresh(token)
      },
      initialToken
    )

    this.prisma = prismaClient
  }

  static async getTokens(prisma: PrismaClient): Promise<Auth | null> {
    return await prisma.auth.findFirst({
      where: { id: 1 }
    })
  }

  private async onRefresh(token: AccessToken): Promise<void> {
    const query = {
      ...token,
      obtainmentTimestamp: new Date(token.obtainmentTimestamp)
    }

    await this.prisma.auth.upsert({
      create: query,
      update: query,
      where: { id: 1 }
    })
  }
}
