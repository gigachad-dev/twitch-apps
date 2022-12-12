import type { Command } from '@twitch-apps/prisma'

export interface CommandOptions
  extends Omit<
    Command,
    'id' | 'cooldown' | 'lastCooldownTime' | 'ignoreCooldown'
  > {
  args: CommandArgumentOptions[]
}

export interface CommandArgumentOptions {
  name: string
  type: StringConstructor | NumberConstructor | BooleanConstructor
  defaultValue?: string | number | boolean
  prepare?: (value: unknown) => string | number | boolean | void
}

export type CommandParsedArguments = Record<
  string,
  string | number | boolean | null
>

export type CommandProvider = Record<string, CommandOptions>

export type CommandDefaultOptions = Omit<
  CommandOptions,
  'commandType' | 'responses'
>

export interface CommandArguments {
  command: string
  prefix: string
  args: string[]
}
