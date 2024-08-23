import path from "node:path"

export function extractDirectory(stackLine: string) {
  const filepath = stackLine
    .split(" ")
    .at(-1)!
    .split("//")
    .at(-1)!
    .split("(")
    .at(-1)!

  return path.dirname(filepath)
}

export function resolveRelativePath(filepath: string) {
  const stack = new Error().stack!.split("\n")
  const directory = extractDirectory(stack[3])
  return path.resolve(directory, filepath)
}
