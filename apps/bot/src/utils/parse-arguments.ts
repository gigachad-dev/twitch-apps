export type ArgumentValueType = string | number | boolean | null

export interface CommandArgs {
  name: string
  defaultValue?: ArgumentValueType
  transform: (value: ArgumentValueType) => ArgumentValueType
}

export function prepareArguments<T extends Record<string, ArgumentValueType>>(
  args: string[],
  argsMap: CommandArgs[]
): T {
  return argsMap.reduce((acc, arg, key) => {
    const argValue = (args[key] ?? arg.defaultValue)!
    const transformedValue = arg.transform(argValue)
    // @ts-ignore
    acc[arg.name] = transformedValue ?? arg.defaultValue
    return acc
  }, {} as T)
}
