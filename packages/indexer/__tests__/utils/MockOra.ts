import { vi } from "vitest"
import { setOra } from "../../src/Reporter.js"

export function MockOra() {
  const spinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: "",
    prefixText: "",
  }
  spinner.start.mockReturnValue(spinner)
  spinner.succeed.mockReturnValue(spinner)
  spinner.fail.mockReturnValue(spinner)
  const ora = vi.fn().mockReturnValue(spinner)

  setOra(ora)

  return { spinner, ora }
}

export type MockOra = ReturnType<typeof MockOra>
