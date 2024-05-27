import { EventEmitter } from "node:stream"
import { vi } from "vitest"
import { setPShell } from "../../src/EntityExtractor/index.js"

export function MockPython<Input extends string | Object, Output>() {
  const eventEmitter = new EventEmitter<{ message: [unknown] }>()
  const send = vi.fn<[Input], void>()
  const worker = Object.assign(eventEmitter, { send })

  const pythonShell = vi.fn().mockReturnValue(worker)
  setPShell(pythonShell as any)

  const mockImplementation = (mock: (message: Input) => Output) => {
    worker.send.mockImplementation((message: Input) => {
      worker.emit("message", mock(message))
    })
  }
  const mockReturnValue = (value: Output) => {
    mockImplementation(() => value)
  }

  return { worker, mockImplementation, mockReturnValue }
}

export type MockPython = ReturnType<typeof MockPython>
