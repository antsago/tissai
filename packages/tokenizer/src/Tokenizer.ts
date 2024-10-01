import { parseText, Lexer } from "./parseText/index.js"
import { parsePage } from "./parsePage/index.js"

export function Tokenizer() {
  const lexer = Lexer()

  return {
    fromText: (title: string) => parseText(lexer, title),
    close: () => lexer.close(),
  }
}

export type Tokenizer = ReturnType<typeof Tokenizer>
