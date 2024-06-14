import { describe, test, beforeEach } from "vitest"
import { mockOraFixture } from "#mocks"
import { Reporter } from "./Reporter.js"

const it = test.extend<{ ora: mockOraFixture }>({
  ora: [mockOraFixture, { auto: true }],
})

describe("Reporter", () => {
  const MESSAGE = "Hola mundo"

  let reporter: Reporter
  beforeEach(() => {
    reporter = Reporter()
  })

  it("starts spinner on create", async ({ expect, ora }) => {
    expect(ora.spinner.start).toHaveBeenCalled()
  })

  it("reports progress", async ({ expect, ora }) => {
    reporter.progress(MESSAGE)

    expect(ora.spinner.text).toBe(`${MESSAGE}\n`)
  })

  it("reports failure", async ({ expect, ora }) => {
    reporter.fail(MESSAGE)

    expect(ora.spinner.fail).toHaveBeenCalledWith(`${MESSAGE}\n`)
  })

  it("reports success", async ({ expect, ora }) => {
    reporter.succeed(MESSAGE)

    expect(ora.spinner.succeed).toHaveBeenCalledWith(`${MESSAGE}\n`)
  })

  it("reports errors", async ({ expect, ora }) => {
    const message2 = "Another error message"
    reporter.error(MESSAGE)
    reporter.error(message2)

    expect(ora.spinner.prefixText).toContain(MESSAGE)
    expect(ora.spinner.prefixText).toContain(message2)
  })

  it("reports logs", async ({ expect, ora }) => {
    const message2 = "Another message"
    reporter.log(MESSAGE)
    reporter.log(message2)

    expect(ora.spinner.prefixText).toContain(MESSAGE)
    expect(ora.spinner.prefixText).toContain(message2)
  })
})
