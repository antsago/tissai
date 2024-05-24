import { PythonShell } from "python-shell"

type Resolver<T> = (value: T | PromiseLike<T>) => void

function PythonPool<Input extends string | object, Output>(scriptPath: string) {
  const resolvers: Resolver<Output>[] = []

  const model = new PythonShell(scriptPath, {
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

export default PythonPool
