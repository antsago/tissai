import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"

export type Label = { label: string; value: string }

export function LlmLabeler(logger = reporter) {
  return PythonPool<{ title: string; words: string[] }, Label[]>(
    `./labelWords.py`,
    logger,
  )
}

export type LlmLabeler = ReturnType<typeof LlmLabeler>
