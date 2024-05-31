import { vi } from "vitest"
import { setOra, resetReporter } from "../../src/Reporter.js"

export function MockOra() {
  const spinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: '',
    prefixText: '',
  }
  spinner.start.mockReturnValue(spinner)
  spinner.succeed.mockReturnValue(spinner)
  spinner.fail.mockReturnValue(spinner)
  const ora = vi.fn().mockReturnValue(spinner)

  setOra(ora)
  resetReporter()

  return { spinner, ora}
}

// Silence console
vi.mock('ora', async () => {
  const spinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: '',
    prefixText: '',
  }
  spinner.start.mockReturnValue(spinner)
  spinner.succeed.mockReturnValue(spinner)
  spinner.fail.mockReturnValue(spinner)
  const ora = vi.fn().mockReturnValue(spinner)
  const realOra = await vi.importActual('ora')

  return { ...realOra, default: ora }
})

export type MockOra = ReturnType<typeof MockOra>
