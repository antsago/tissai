import { EventEmitter } from "node:stream"
import { vi } from "vitest"
import { setPShell } from "../../src/EntityExtractor/index.js"
import type { PythonShellError } from "python-shell"

type WorkerEvents = {
  message: [unknown]
  stderr: [string]
  pythonError: [PythonShellError]
  close: []
}

export function MockPython<Input extends string | Object, Output>() {
  const eventEmitter = new EventEmitter<WorkerEvents>()
  const send = vi.fn<[Input], void>()
  const worker = Object.assign(eventEmitter, { send })

  const PythonShell = vi.fn().mockReturnValue(worker)
  setPShell(PythonShell as any)

  const mockImplementation = (mock: (message: Input) => Output) => {
    worker.send.mockImplementation((message: Input) => {
      worker.emit("message", mock(message))
    })
  }
  const mockReturnValue = (value: Output) => {
    mockImplementation(() => value)
  }

  return { PythonShell, worker, mockImplementation, mockReturnValue }
}

export type MockPython = ReturnType<typeof MockPython>
