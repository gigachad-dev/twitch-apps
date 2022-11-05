export type ArgumentValueType = string | number | boolean | null

export interface CommandArgs {
  name: string
  defaultValue?: ArgumentValueType
  transform?: (value: ArgumentValueType) => ArgumentValueType
}

export function prepareArguments<T extends Record<string, ArgumentValueType>>(
  args: string[],
  argsMap: CommandArgs[]
) {
  return argsMap.reduce((acc, arg, key) => {
    const argValue = args[key] ?? arg.defaultValue
    let transformedValue = argValue
    if (arg.transform && argValue) {
      transformedValue = arg.transform(argValue)
    }
    // @ts-ignore
    acc[arg.name] = transformedValue
    return acc
  }, {} as T)
}
