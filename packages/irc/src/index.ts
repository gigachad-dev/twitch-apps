import { AuthProvider } from '@twitch-apps/auth'
import { Client } from '@twurple/auth-tmi'

export class IrcClient extends Client {
  constructor(authProvider: AuthProvider, channel: string) {
    super({
      options: {
        debug: true
      },
      connection: {
        secure: true,
        reconnect: true
      },
      authProvider,
      channels: [channel]
    })
  }
}
