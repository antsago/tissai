import path from "node:path"
import { expect, describe, test, beforeEach, afterEach, vi } from "vitest"
import { PythonShellError } from "python-shell"
import { mockPythonFixture } from "#mocks"
import { PythonPool } from "./PythonPool.js"

type Fixtures = { python: mockPythonFixture }
const it = test.extend<Fixtures>({
  python: [mockPythonFixture, { auto: true }],
})

describe("PythonPool", () => {
  const SCRIPT_PATH = "./foo/bar.py"
  const QUERY = "A query"
  const RESPONSE = { the: "response" }

  const log = vi.fn()
  let pool: PythonPool<string, any>
  beforeEach(async () => {
    pool = PythonPool(SCRIPT_PATH, { log })
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  it("starts script on initialization", async ({ python }) => {
    expect(python.PythonShell).toHaveBeenCalledWith(SCRIPT_PATH, {
      mode: "json",
      scriptPath: import.meta.dirname,
      pythonOptions: ["-u"],
      pythonPath: python.PYTHON_PATH,
    })
    expect(python.exec).toHaveBeenCalledWith("poetry env info --executable", {
      cwd: import.meta.dirname,
    })
  })

  it("forwards responses to requests", async ({ python }) => {
    python.worker.send.mockImplementation(() =>
      python.worker.emit("message", RESPONSE),
    )

    const result = await pool.send(QUERY)

    expect(result).toStrictEqual(RESPONSE)
    expect(python.worker.send).toHaveBeenCalledWith(QUERY)
  })

  it("supports simultaneous queries", async ({ python }) => {
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

  it("prints unexpected messages to stderr", async ({ python }) => {
    const message = "Hello world"

    python.worker.emit("message", message)

    expect(log).toHaveBeenCalledWith(message)
  })

  it("prints error messages to stderr", async ({ python }) => {
    const message = "Something went wrong"

    python.worker.emit("stderr", message)

    expect(log).toHaveBeenCalledWith(message)
  })

  it("throws on exit with error", async ({ python }) => {
    const error = new PythonShellError("Booh!")

    const act = () => python.worker.emit("pythonError", error)

    expect(act).toThrow(error)
  })

  it("throws on unexpected exit without error", async ({ python }) => {
    const act = () => python.worker.emit("close")

    expect(act).toThrow()
  })

  it("kills process on close", async ({ python }) => {
    await pool.close()

    expect(python.worker.end).toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })
})
