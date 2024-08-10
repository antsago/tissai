import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { PythonPool } from "@tissai/python-pool"

export type Token = { text: string; isMeaningful: boolean; trailing: string }

export function Scanner() {
  const currentDirectory = dirname(fileURLToPath(import.meta.url))
  const python: PythonPool<string, Token[]> = PythonPool(
    `${currentDirectory}/scanner.py`,
    console,
  )

  return {
    tokenize: (text: string) => python.send(text),
    close: () => python.close(),
  }
}

export type Scanner = ReturnType<typeof Scanner>
