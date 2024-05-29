import { expect, describe, it, beforeEach, vi } from "vitest"
import { Reporter, setOra } from "./Reporter.js"

describe("Reporter", () => {
  const MESSAGE = "Hola mundo"

  let spinner: any
  let reporter: Reporter
  beforeEach(() => {
    spinner = {
      start: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis(),
      text: '',
      prefixText: '',
    }
    const ora = vi.fn().mockReturnValue(spinner)
    setOra(ora)

    reporter = Reporter()
  })

  it("starts spinner on create", async () => {
    expect(spinner.start).toHaveBeenCalled()
  })

  it("reports progress", async () => {
    reporter.progress(MESSAGE)

    expect(spinner.text).toBe(`${MESSAGE}\n`)
  })

  it("reports failure", async () => {
    reporter.fail(MESSAGE)

    expect(spinner.fail).toHaveBeenCalledWith(`${MESSAGE}\n`)
  })

  it("reports success", async () => {
    reporter.succeed(MESSAGE)

    expect(spinner.succeed).toHaveBeenCalledWith(`${MESSAGE}\n`)
  })

  it("reports errors", async () => {
    const message2 = "Another error message"
    reporter.error(MESSAGE)
    reporter.error(message2)

    expect(spinner.prefixText).toContain(MESSAGE)
    expect(spinner.prefixText).toContain(message2)
  })

  it("reports logs", async () => {
    const message2 = "Another message"
    reporter.log(MESSAGE)
    reporter.log(message2)

    expect(spinner.prefixText).toContain(MESSAGE)
    expect(spinner.prefixText).toContain(message2)
  })
})
