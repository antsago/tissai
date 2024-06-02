import { expect, describe, it, beforeEach } from "vitest"
import { MockOra } from '#mocks'
import { Reporter } from "./Reporter.js"

describe("Reporter", () => {
  const MESSAGE = "Hola mundo"

  let ora: MockOra
  let reporter: Reporter
  beforeEach(() => {
    ora = MockOra()
    reporter = Reporter()
  })

  it("starts spinner on create", async () => {
    expect(ora.spinner.start).toHaveBeenCalled()
  })

  it("reports progress", async () => {
    reporter.progress(MESSAGE)

    expect(ora.spinner.text).toBe(`${MESSAGE}\n`)
  })

  it("reports failure", async () => {
    reporter.fail(MESSAGE)

    expect(ora.spinner.fail).toHaveBeenCalledWith(`${MESSAGE}\n`)
  })

  it("reports success", async () => {
    reporter.succeed(MESSAGE)

    expect(ora.spinner.succeed).toHaveBeenCalledWith(`${MESSAGE}\n`)
  })

  it("reports errors", async () => {
    const message2 = "Another error message"
    reporter.error(MESSAGE)
    reporter.error(message2)

    expect(ora.spinner.prefixText).toContain(MESSAGE)
    expect(ora.spinner.prefixText).toContain(message2)
  })

  it("reports logs", async () => {
    const message2 = "Another message"
    reporter.log(MESSAGE)
    reporter.log(message2)

    expect(ora.spinner.prefixText).toContain(MESSAGE)
    expect(ora.spinner.prefixText).toContain(message2)
  })
})
