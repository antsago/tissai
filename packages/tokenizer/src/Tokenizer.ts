import { parseText, Scanner } from "./parseText/index.js"
import { parsePage } from "./parsePage/index.js"

export function Tokenizer() {
  const scanner = Scanner()

  return {
    fromText: (title: string) => parseText(scanner, title),
    fromPage: parsePage,
    close: () => scanner.close(),
  }
}

export type Tokenizer = ReturnType<typeof Tokenizer>
