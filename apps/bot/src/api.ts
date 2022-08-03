import { AuthProvider } from '@twitch-apps/auth'
import { ApiClient } from '@twurple/api'

export class Api extends ApiClient {
  constructor(authProvider: AuthProvider) {
    super({ authProvider })
  }
}
