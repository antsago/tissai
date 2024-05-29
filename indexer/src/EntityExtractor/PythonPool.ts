import { PythonShell as PShell } from "python-shell"

let PythonShell = PShell
export function setPShell(mock: typeof PShell) {
  PythonShell = mock
}

type Resolver<T> = (value: T | PromiseLike<T>) => void

function PythonPool<Input extends string | Object, Output>(scriptPath: string) {
  const resolvers: Resolver<Output>[] = []

  const worker = new PythonShell(scriptPath, {
    mode: "json",
    pythonOptions: ["-u"], // get print results in real-time
  })

  worker.on("message", (message: Output) => {
    const resolver = resolvers.shift()
    if (resolver) {
      resolver(message)
    } else {
      console.error(message)
    }
  })

  worker.on("close", () => {
    throw new Error("Python process exit unexpectedly")
  })
  worker.on("pythonError", (error) => {
    throw error
  })
  worker.on("stderr", (errorMessage) => {
    console.error(errorMessage)
  })

  return async (query: Input) => {
    const promise = new Promise<Output>((res) => resolvers.push(res))

    worker.send(query)
    return promise
  }
}

export default PythonPool
