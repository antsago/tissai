import type { PythonShellError } from "python-shell"
import { EventEmitter } from "node:stream"
import { vi } from "vitest"
import { setShells } from "../../src/PythonPool.js"

type WorkerEvents = {
  message: [unknown]
  stderr: [string]
  pythonError: [PythonShellError]
  close: []
}

const PYTHON_PATH = "/path/to/python/env"

export function MockPython<Input extends string | Object, Output>() {
  const exec = vi.fn().mockReturnValue(Buffer.from(`${PYTHON_PATH}\n`))

  const eventEmitter = new EventEmitter<WorkerEvents>()
  const send = vi.fn()
  const end = vi.fn().mockImplementation((cb) => {
    worker.emit("close")
    cb()
  })
  const worker = Object.assign(eventEmitter, { send, end })
  const PythonShell = vi.fn().mockReturnValue(worker)

  setShells(PythonShell as any, exec)

  const mockImplementation = (mock: (message: Input) => Output) => {
    worker.send.mockImplementation((message: Input) => {
      worker.emit("message", mock(message))
    })
  }
  const mockReturnValue = (value: Output) => {
    mockImplementation(() => value)
  }

  return {
    PythonShell,
    worker,
    mockImplementation,
    mockReturnValue,
    exec,
    PYTHON_PATH,
  }
}

export type MockPython = ReturnType<typeof MockPython>
