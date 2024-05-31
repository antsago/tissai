import { expect, describe, it, beforeEach, vi } from "vitest"
import { PythonShellError } from "python-shell"
import { MockPython, MockOra } from "#mocks"
import PythonPool from "./PythonPool.js"

describe("PythonPool", () => {
  const SCRIPT_PATH = "/foo/bar.py"
  const QUERY = "A query"
  const RESPONSE = { the: "response" }

  let ora: MockOra
  let python: MockPython
  let request: ReturnType<typeof PythonPool>
  beforeEach(async () => {
    vi.resetAllMocks()

    ora = MockOra()
    python = MockPython()
    request = PythonPool(SCRIPT_PATH)
  })

  it("starts script on initialization", async () => {
    expect(python.PythonShell).toHaveBeenCalledWith(
      SCRIPT_PATH,
      expect.anything(),
    )
  })

  it("forwards responses to requests", async () => {
    python.worker.send.mockImplementation(() =>
      python.worker.emit("message", RESPONSE),
    )

    const result = await request(QUERY)

    expect(result).toStrictEqual(RESPONSE)
    expect(python.worker.send).toHaveBeenCalledWith(QUERY)
  })

  it("supports simultaneous queries", async () => {
    const FIRST_RESPONSE = { first: "reponse" }
    const FIRST_QUERY = "Another query"
    python.worker.send.mockImplementationOnce(() =>
      python.worker.emit("message", FIRST_RESPONSE),
    )
    python.worker.send.mockImplementation(() =>
      python.worker.emit("message", RESPONSE),
    )

    const [result1, result2] = await Promise.all([
      request(FIRST_QUERY),
      request(QUERY),
    ])

    expect(result1).toStrictEqual(FIRST_RESPONSE)
    expect(result2).toStrictEqual(RESPONSE)
    expect(python.worker.send).toHaveBeenNthCalledWith(1, FIRST_QUERY)
    expect(python.worker.send).toHaveBeenNthCalledWith(2, QUERY)
  })

  it("prints unexpected messages to stderr", async () => {
    const message = "Hello world"

    python.worker.emit("message", message)

    expect(ora.spinner.prefixText).toContain(message)
  })

  it("prints error messages to stderr", async () => {
    const message = "Something went wrong"

    python.worker.emit("stderr", message)

    expect(ora.spinner.prefixText).toContain(message)
  })

  it("throws on exit with error", async () => {
    const error = new PythonShellError("Booh!")

    const act = () => python.worker.emit("pythonError", error)

    expect(act).toThrow(error)
  })

  it("throws on exit without error", async () => {
    const act = () => python.worker.emit("close")

    expect(act).toThrow()
  })
})
