import { PythonPool } from "@tissai/python-pool"

export type RawToken = { text: string; isMeaningful: boolean; trailing: string }

export function Lexer() {
  const python: PythonPool<string, RawToken[]> = PythonPool(
    "./lexer.py",
    console,
  )

  return {
    tokenize: (text: string) => python.send(text),
    close: () => python.close(),
  }
}

export type Lexer = ReturnType<typeof Lexer>
