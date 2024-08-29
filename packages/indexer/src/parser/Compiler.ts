import Lexer, { type Token as LexerToken } from "../lexer/index.js"
import type { WordToken, Rule, LabelMap } from "./types.js"
import { TokenReader } from "./TokenReader.js"

const labeler = (map: LabelMap) => (tokens: LexerToken[]) =>
  tokens.map((t) => ({
    ...t,
    labels:
      t.isMeaningful && t.text in map ? Object.keys(map[t.text]) : ["filler"],
  }))

export function Compiler(map: LabelMap) {
  const lexer = Lexer()
  const label = labeler(map)

  const compile =
    <Output>(grammar: Rule<WordToken, Output>) =>
    async (title: string) => {
      const tokens = await lexer.asText(title)
      const labeled = label(tokens)
      return grammar(TokenReader(labeled))
    }

  return {
    compile,
    close: () => lexer.close(),
  }
}

export type Compiler = ReturnType<typeof Compiler>
