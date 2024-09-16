import { Tokenizer } from "@tissai/tokenizer"
import { Ontology, type Schema } from "./grammar/index.js"
import { TokenReader } from "./TokenReader.js"

export function Compiler(getSchemas: (tokenizer: Tokenizer) => Schema[]) {
  const tokenizer = Tokenizer()
  const Product = Ontology(getSchemas(tokenizer))

  return {
    parse: (page: string) => {
      const tokens = tokenizer.fromPage(page)
      const reader = TokenReader(tokens)
      return Product(reader)
    },
    close: () => tokenizer.close(),
  }
}

export type Compiler = ReturnType<typeof Compiler>
