import Lexer, { type Token as LexerToken } from "../lexer/index.js"
import type { WordToken, Rule, LabelMap } from "./types.js"
import { TokenReader } from "./TokenReader.js"

const getLabels = (map: LabelMap) => (tokens: LexerToken[]) =>
  tokens.map((t) => t.text in map ? Object.keys(map[t.text]) : ["unknown"])


export const labelTokens = async (
  tokens: LexerToken[],
  map: LabelMap,
) => {
  const labels = await getLabels(map)(tokens.filter((t) => t.isMeaningful))

  let labelsIndex = 0
  const labeled = tokens.map((t) => {
    if (!t.isMeaningful) {
      return {
        ...t,
        labels: [],
      }
    }

    const wordLabels = labels[labelsIndex]
    labelsIndex += 1

    return {
      ...t,
      labels: wordLabels,
    }
  })

  return labeled
}
export function Compiler(map: LabelMap) {
  const lexer = Lexer()

  const compile =
    <Output>(grammar: Rule<WordToken, Output>) =>
    async (title: string) => {
      const tokens = await lexer.asText(title)
      const labeled = await labelTokens(tokens, map)
      return grammar(TokenReader(labeled))
    }

  return {
    compile,
    close: () => lexer.close(),
  }
}

export type Compiler = ReturnType<typeof Compiler>
