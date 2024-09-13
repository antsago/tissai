import { PythonPool } from "@tissai/python-pool"

type LlmOptions = Partial<{
  max_new_tokens: number
  return_full_text: boolean
  do_sample: boolean
  num_beams: number
  num_beam_groups: number
  diversity_penalty: number
  num_return_sequences: number
}>

export function LLM(logger: Parameters<typeof PythonPool>[1] = console) {
  return PythonPool<
    { prompt: string; options: LlmOptions },
    string[]
  >(`./LLM.py`, logger)
}

export type LLM = ReturnType<typeof LLM>
