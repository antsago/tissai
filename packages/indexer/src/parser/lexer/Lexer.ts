import { Scanner } from "./Scanner.js"
import { normalizer, type Token } from "./normalizer.js"
import { labelTokens } from "./labelTokens.js"
import { parsePage } from "./parsePage.js"

type Labeler = (tokens: Token[]) => Promise<string[]> | string[]

export function Lexer() {
  const scanner = Scanner()

  return {
    fromText: async (title: string, getLabels: Labeler) => {
      const rawTokens = await scanner.tokenize(title)
      const tokens = normalizer(rawTokens)
      const labels = await getLabels(tokens.filter((t) => t.isMeaningful))
      return labelTokens(tokens, labels)
    },
    fromPage: parsePage,
    close: () => scanner.close(),
  }
}

export type Lexer = ReturnType<typeof Lexer>
