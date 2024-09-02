import { Scanner } from "./Scanner.js"
import { normalizer } from "./normalizer.js"
import { type Labeler, labelTokens } from "./labelTokens.js"
import { parsePage } from "./parsePage.js"

export function Lexer() {
  const scanner = Scanner()

  return {
    fromText: async (title: string, getLabels: Labeler) => {
      const tokens = await scanner.tokenize(title)
      return labelTokens(normalizer(tokens), getLabels)
    },
    fromPage: parsePage,
    close: () => scanner.close(),
  }
}

export type Lexer = ReturnType<typeof Lexer>
