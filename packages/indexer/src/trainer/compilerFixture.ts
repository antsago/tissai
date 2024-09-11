import { Compiler } from "../parser/index.js"
import { getSchemas } from "./schemas.js"
import { LlmLabeler } from "./LlmLabeler/index.js"
import { Reporter } from "../PageServer/index.js"

export const compilerFixture = (reporter: Reporter) => {
  const python = LlmLabeler(reporter)
  const compiler = Compiler(getSchemas(python))
  return [
    compiler,
    () => Promise.all([compiler?.close(), python?.close()]),
  ] as const
}
