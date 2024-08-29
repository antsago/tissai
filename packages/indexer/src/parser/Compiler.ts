import Lexer, { type Token as LexerToken } from "../lexer/index.js"
import type { WordToken, Rule, LabelMap } from "./types.js"
import { TokenReader } from "./TokenReader.js"

const getLabels = (map: LabelMap) => (tokens: LexerToken[]) =>
  tokens.map((t) => t.text in map ? Object.keys(map[t.text]) : ["unknown"])

export function Compiler(map: LabelMap) {
  const lexer = Lexer()

  const compile =
    <Output>(grammar: Rule<WordToken, Output>) =>
    async (title: string) => {
      const tokens = await lexer.asText(title, getLabels(map))
      return grammar(TokenReader(tokens))
    }

  return {
    compile,
    close: () => lexer.close(),
  }
}

export type Compiler = ReturnType<typeof Compiler>
