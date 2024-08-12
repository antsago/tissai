import path from "node:path"

export function getCallerFilePath(depth = 1) {
  let stack = new Error().stack!.split('\n')
  return stack[1+depth].split(":")[0].split(" ").at(-1)!.split("(").at(-1)!
}

export function resolveRelativePath(filepath: string) {
  const directory = path.dirname(getCallerFilePath(3))
  return path.resolve(directory, filepath)
}
