import type { CommandArguments } from './types.js'

export function parseMessage(message: string): CommandArguments | null {
  const regex = new RegExp('^(!)([^\\s]+) ?(.*)', 'gims')
  const matches = regex.exec(message)

  if (matches) {
    const prefix = matches[1]
    const command = matches[2]
    const result = {
      command: command,
      prefix: prefix,
      args: []
    } as CommandArguments

    if (matches.length > 3) {
      result.args = matches[3]!
        .trim()
        .split(' ')
        .filter((v) => v !== '')
    }

    return result
  }

  return null
}
