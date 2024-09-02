import { Lexer, Ontology, type Schema, TokenReader } from "../parser/index.js"

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
