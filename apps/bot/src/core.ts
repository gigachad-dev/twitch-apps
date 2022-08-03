import type { ApiClient } from '@twurple/api/lib'
import type { ChatClient } from '@twurple/chat'

export class CoreClient {
  constructor(
    public readonly chat: ChatClient,
    public readonly api: ApiClient
  ) {}
}
