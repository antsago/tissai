import { execSync } from "node:child_process"
import { PythonShell as PShell } from "python-shell"
import { getCallerDirectory } from "./pathUtils.js"

let PythonShell = PShell
let exec = execSync
export function setShells(pShell: typeof PShell, execShell: typeof exec) {
  PythonShell = pShell
  exec = execShell
}

type Resolver<T> = (value: T | PromiseLike<T>) => void

export function PythonPool<Input extends string | Object, Output>(
  scriptPath: string,
  reporter: { log: (message: string) => void },
) {
  const resolvers: Resolver<Output>[] = []
  let expectExit = false

  const cwd = getCallerDirectory()
  const pythonPath = exec("poetry env info --executable", {
    cwd,
  })
    .toString()
    .trim()

  const worker = new PythonShell(scriptPath, {
    mode: "json",
    scriptPath: cwd,
    pythonOptions: ["-u"], // get print results in real-time
    pythonPath,
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

export type PythonPool<I extends string | object, O> = ReturnType<
  typeof PythonPool<I, O>
>
