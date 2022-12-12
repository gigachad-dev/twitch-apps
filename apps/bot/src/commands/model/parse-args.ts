import type { CommandArgumentOptions, CommandParsedArguments } from './types.js'

export function parseArgs(
  argsOptions: CommandArgumentOptions[],
  argsValues: string[]
): CommandParsedArguments | null {
  if (!argsOptions.length) return null

  const parsedArgs: CommandParsedArguments = {}

  for (let i = 0; i < argsOptions.length; i++) {
    const args = argsOptions[i]!

    if (argsValues[i]) {
      if (args.type) {
        parsedArgs[args.name] = args.type(argsValues[i])
      }

      if (args.prepare) {
        const preparedValue = args.prepare(
          parsedArgs[args.name] || argsValues[i]
        )

        if (preparedValue) {
          parsedArgs[args.name] = preparedValue
        }
      }
    } else {
      if (args.defaultValue) {
        parsedArgs[args.name] = args.defaultValue
      } else {
        parsedArgs[args.name] = null
      }
    }
  }

  return parsedArgs
}
