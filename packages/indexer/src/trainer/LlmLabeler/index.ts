import { PythonPool } from "@tissai/python-pool"

export type Property = { labels: string[]; value: string }
export function LlmLabeler(logger: Parameters<typeof PythonPool>[1] = console) {
  return PythonPool<
    { title: string; words: string[] },
    { category: string; properties: Property[] }
  >(`./LlmLabeler.py`, logger)
}

export type LlmLabeler = ReturnType<typeof LlmLabeler>
