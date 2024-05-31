import { vi } from "vitest"
import { setOra } from "../../src/Reporter.js"

export function MockOra() {
  const spinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: '',
    prefixText: '',
  }

  const ora = vi.fn().mockReturnValue(spinner)
  setOra(ora)

  return { spinner, ora}
}

export type MockOra = ReturnType<typeof MockOra>
