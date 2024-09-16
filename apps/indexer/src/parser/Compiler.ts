import { Lexer } from "@tissai/tokenizer"
import { Ontology, type Schema } from "./grammar/index.js"
import { TokenReader } from "./TokenReader.js"

export function Compiler(getSchemas: (lexer: Lexer) => Schema[]) {
  const lexer = Lexer()
  const Product = Ontology(getSchemas(lexer))

  return {
    parse: (page: string) => {
      const tokens = lexer.fromPage(page)
      const reader = TokenReader(tokens)
      return Product(reader)
    },
    close: () => lexer.close(),
  }
}

export type Compiler = ReturnType<typeof Compiler>
