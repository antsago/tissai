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

export function getCallerDirectory() {
  const stack = new Error().stack!.split("\n")
  return extractDirectory(stack[3])
}
