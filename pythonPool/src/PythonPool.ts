import { PythonShell as PShell } from "python-shell"

let PythonShell = PShell
export function setPShell(mock: typeof PShell) {
  PythonShell = mock
}

type Resolver<T> = (value: T | PromiseLike<T>) => void

export function PythonPool<Input extends string | Object, Output>(scriptPath: string, reporter: { log: (message: string) => void}) {
  const resolvers: Resolver<Output>[] = []
  let expectExit = false

  const worker = new PythonShell(scriptPath, {
    mode: "json",
    pythonOptions: ["-u"], // get print results in real-time
  })

  worker.on("message", (message: Output) => {
    const resolver = resolvers.shift()
    if (resolver) {
      resolver(message)
    } else {
      reporter.log(String(message))
    }
  })

  worker.on("close", () => {
    if (!expectExit) {
      throw new Error("Python process exit unexpectedly")
    }
  })
  worker.on("pythonError", (error) => {
    throw error
  })
  worker.on("stderr", (errorMessage) => {
    reporter.log(errorMessage)
  })

  return {
    send: async (query: Input) => {
      const promise = new Promise<Output>((res) => resolvers.push(res))

      worker.send(query)
      return promise
    },
    close: async () => {
      expectExit = true
      return new Promise<void>((res, rej) =>
        worker.end((err) => {
          if (err) {
            rej(err)
          } else {
            res()
          }
        }),
      )
    },
  }
}

export type PythonPool = ReturnType<typeof PythonPool>
