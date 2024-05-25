import { EventEmitter } from "node:stream"
import { vi } from "vitest"
import { setPShell } from "../../src/EntityExtractor/index.js"

export function MockPython() {
  const eventEmitter = new EventEmitter<{ message: [unknown] }>()
  const send = vi.fn()
  const worker = Object.assign(eventEmitter, { send })

  const pythonShell = vi.fn().mockReturnValue(worker)
  setPShell(pythonShell as any)

  const mockImplementation = (mock: () => unknown) => {
    worker.send.mockImplementation(() => {
      worker.emit("message", mock())
    })
  }

  return { worker, mockImplementation }
}

export type MockPython = ReturnType<typeof MockPython>
