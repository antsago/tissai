import { expect, describe, it, beforeEach, vi } from "vitest"
import { PythonShellError } from "python-shell"
import { MockPython } from "#mocks"
import { PythonPool } from "./PythonPool.js"

describe("PythonPool", () => {
  const SCRIPT_PATH = "/foo/bar.py"
  const QUERY = "A query"
  const RESPONSE = { the: "response" }

  const log = vi.fn()
  let python: MockPython
  let pool: PythonPool
  beforeEach(async () => {
    vi.resetAllMocks()

    python = MockPython()
    pool = PythonPool(SCRIPT_PATH, { log })
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

    const result = await pool.send(QUERY)

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
      pool.send(FIRST_QUERY),
      pool.send(QUERY),
    ])

    expect(result1).toStrictEqual(FIRST_RESPONSE)
    expect(result2).toStrictEqual(RESPONSE)
    expect(python.worker.send).toHaveBeenNthCalledWith(1, FIRST_QUERY)
    expect(python.worker.send).toHaveBeenNthCalledWith(2, QUERY)
  })

  it("prints unexpected messages to stderr", async () => {
    const message = "Hello world"

    python.worker.emit("message", message)

    expect(log).toHaveBeenCalledWith(message)
  })

  it("prints error messages to stderr", async () => {
    const message = "Something went wrong"

    python.worker.emit("stderr", message)

    expect(log).toHaveBeenCalledWith(message)
  })

  it("throws on exit with error", async () => {
    const error = new PythonShellError("Booh!")

    const act = () => python.worker.emit("pythonError", error)

    expect(act).toThrow(error)
  })

  it("throws on unexpected exit without error", async () => {
    const act = () => python.worker.emit("close")

    expect(act).toThrow()
  })

  it("kills process on close", async () => {
    await pool.close()

    expect(python.worker.end).toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })
})
