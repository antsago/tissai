import { dirname } from "path"
import { fileURLToPath } from "url"
import { PythonShell } from "python-shell"

type Resolver<T> = (value: T | PromiseLike<T>) => void

function Embedder<Input extends string | object, Output>() {
  const resolvers: Resolver<Output>[] = []
  const currentDirectory = dirname(fileURLToPath(import.meta.url))
  const model = new PythonShell(`${currentDirectory}/embedder.py`, {
    mode: "json",
    pythonOptions: ["-u"], // get print results in real-time
  })

  model.on("message", (message: Output) => {
    resolvers.shift()?.(message)
  })

  return async (query: Input) => {
    const promise = new Promise<Output>((res) => resolvers.push(res))

    model.send(query)
    return promise
  }
}

export default Embedder
