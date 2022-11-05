import { AuthProvider } from '@twitch-apps/auth'
import { ChatClient } from '@twurple/chat'

export class Chat extends ChatClient {
  constructor(authProvider: AuthProvider, channels: string[]) {
    super({ authProvider, channels })
  }
}
