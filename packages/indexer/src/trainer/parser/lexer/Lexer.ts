import { Scanner } from "./Scanner.js"
import { normalizer } from "./normalizer.js"
import { parsePage } from "./parsePage.js"

export function Lexer() {
  const scanner = Scanner()

  return {
    fromText: async (title: string) => {
      const rawTokens = await scanner.tokenize(title)
      const tokens = normalizer(rawTokens)
      return tokens
    },
    fromPage: parsePage,
    close: () => scanner.close(),
  }
}

export type Lexer = ReturnType<typeof Lexer>
