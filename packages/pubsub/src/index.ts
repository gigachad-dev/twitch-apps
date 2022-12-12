import type { AuthProvider } from '@twurple/auth/lib/index.js'
import { PubSubClient, PubSubRedemptionMessage } from '@twurple/pubsub'

export class PubSub extends PubSubClient {
  private userId: string

  constructor(private readonly authProvider: AuthProvider) {
    super()
  }

  async start(): Promise<void> {
    this.userId = await this.registerUserListener(this.authProvider)
  }

  // @ts-ignore
  override onRedemption(callback: (message: PubSubRedemptionMessage) => void) {
    super.onRedemption(this.userId, callback)
  }
}
