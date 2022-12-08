import type { Command } from '@twitch-apps/prisma'
import type { ChatMessage } from '../../chat/chat-message.js'

export interface CommandOptions
  extends Omit<
    Command,
    'id' | 'cooldown' | 'lastCooldownTime' | 'ignoreCooldown'
  > {
  args: CommandArgument[]
}

export interface CommandArgument {
  /**
   * Alias name
   */
  name: string

  /**
   * Value typesafe
   */
  type: StringConstructor | NumberConstructor | BooleanConstructor

  /**
   * Default value
   */
  defaultValue?: string | number | boolean

  /**
   * Prepare value
   */
  prepare?: (
    value: unknown,
    msg?: ChatMessage
  ) => string | number | boolean | void
}

export type NamedParameters = Record<string, string | number | boolean | null>

export type CommandProvider = Record<string, CommandOptions>
