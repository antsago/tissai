import { PythonPool } from "@tissai/python-pool"

export type RawToken = { text: string; isMeaningful: boolean; trailing: string }

export function Scanner() {
  const python: PythonPool<string, RawToken[]> = PythonPool(
    "./scanner.py",
    console,
    "/workspaces/tissai/packages/tokenizer/.venv/bin/python",
  )

  return {
    tokenize: (text: string) => python.send(text),
    close: () => python.close(),
  }
}

export type Scanner = ReturnType<typeof Scanner>
