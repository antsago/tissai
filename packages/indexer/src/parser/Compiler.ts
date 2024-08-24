import Lexer, { type Token as LexerToken } from "../lexer/index.js"
import type { WordToken, Rule } from "./types.js"
import { TokenReader } from "./TokenReader.js"

type LabelMap = Record<string, Record<string, number>>
const labeler = (map: LabelMap) => (tokens: LexerToken[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful && t.text in map? Object.keys(map[t.text]) : ["filler"],
  }))

export function Compiler<Output>(map: LabelMap, grammar: Rule<WordToken, Output>) {
  const lexer = Lexer()
  const label = labeler(map)

  const compile = async (title: string) => {
    const tokens = await lexer.tokenize(title)
    const labeled = label(tokens)
    return grammar(TokenReader(labeled))
  }

  return {
    compile,
    close: () => lexer.close(),
  }
}

export type Compiler<Output> = ReturnType<typeof Compiler<Output>>
