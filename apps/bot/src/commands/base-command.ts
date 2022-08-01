import type { PrivateMessage } from '@twurple/chat/lib/index.js';

export interface CommandOptions {
  alias: string
}

export abstract class BaseCommand {
  constructor(
    public readonly options: CommandOptions
  ) {}

  abstract execute(chat: PrivateMessage, channel: string): Promise<void>
}
