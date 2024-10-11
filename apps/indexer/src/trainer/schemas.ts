import { Tokenizer } from "../parser/index.js"
import type { Reporter } from "../PageServer/index.js"
import { LLM } from "./labeler/index.js"

export const llmFixture = (reporter: Reporter) => {
  const llm = LLM(reporter)
  return [
    llm,
    () => llm?.close(),
  ] as const
}
export const tokenizerFixture = () => {
  const tokenizer = Tokenizer()
  return [
    tokenizer,
    () => tokenizer?.close(),
  ] as const
}
