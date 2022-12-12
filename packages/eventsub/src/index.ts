import { EventSubListener } from '@twurple/eventsub'
import type { EventSubListenerConfig } from '@twurple/eventsub'
import { NgrokAdapter } from '@twurple/eventsub-ngrok'

export class EventSub extends EventSubListener {
  constructor(config: Omit<EventSubListenerConfig, 'adapter'>) {
    super({
      ...config,
      adapter: new NgrokAdapter()
    })
  }
}
