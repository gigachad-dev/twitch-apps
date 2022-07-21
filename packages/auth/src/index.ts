import { RefreshingAuthProvider } from '@twurple/auth'
import type { PrismaClient, Auth } from '@twitch-apps/prisma'
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
    await this.prisma.auth.upsert({
      create: token,
      update: token,
      where: { id: 1 }
    })
  }
}
