import { Scanner } from "./Scanner.js"
import { normalizer } from "./normalizer.js"
import { labelTokens } from "./labelTokens.js"
import { parsePage } from "./parsePage.js"

export function Lexer() {
  const scanner = Scanner()

  return {
    fromText: async (title: string) => {
      const rawTokens = await scanner.tokenize(title)
      return normalizer(rawTokens)
    },
    fromPage: parsePage,
    close: () => scanner.close(),
  }
}

export type Lexer = ReturnType<typeof Lexer>
