import { PrismaClient } from '@twitch-apps/prisma'
import { RefreshingAuthProvider } from '@twurple/auth'
import type { AccessToken } from '@twurple/auth'

interface AuthProviderOpts {
  clientId: string
  clientSecret: string
  initialToken: AccessToken
  prisma: PrismaClient
}

export class AuthProvider extends RefreshingAuthProvider {
  private prisma: PrismaClient

  constructor({
    clientId,
    clientSecret,
    initialToken,
    prisma
  }: AuthProviderOpts) {
    super(
      {
        clientId,
        clientSecret,
        onRefresh: (token) => this.onRefresh(token)
      },
      initialToken
    )

    this.prisma = prisma
  }

  private async onRefresh(token: AccessToken): Promise<void> {
    await this.prisma.auth.upsert({
      create: token,
      update: token,
      where: { id: 1 }
    })
  }
}
