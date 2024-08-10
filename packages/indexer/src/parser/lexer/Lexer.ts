import { Scanner } from "./Scanner.js";
import { normalizer } from "./normalizer.js";

export function Lexer() {
  const scanner = Scanner()

  return {
    tokenize: async (title: string) => {
      const tokens = await scanner.tokenize(title)
      return normalizer(tokens)
    },
    close: () => scanner.close(),
  }
}

export type Lexer = ReturnType<typeof Lexer>
