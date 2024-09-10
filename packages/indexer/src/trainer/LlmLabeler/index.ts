import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../../Reporter.js"

export type Property = { labels: string[]; value: string }

export function LlmLabeler(logger = reporter) {
  return PythonPool<{ title: string; words: string[] }, { category: string, properties: Property[] }>(
    `./LlmLabeler.py`,
    logger,
  )
}

export type LlmLabeler = ReturnType<typeof LlmLabeler>
