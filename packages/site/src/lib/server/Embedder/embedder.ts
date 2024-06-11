import { dirname } from "path"
import { fileURLToPath } from "url"
import { PythonPool } from "@tissai/python-pool"

export type Embedding = number[]
type Embedder = {
  embed: (query: string) => Promise<number[]>
}

function Embedder(): Embedder {
  const currentDirectory = dirname(fileURLToPath(import.meta.url))
  const python = PythonPool<string, number[]>(
    `${currentDirectory}/embedder.py`,
    console,
  )

  return {
    embed: (query) => {
      return python.send(query)
    },
  }
}

export default Embedder
