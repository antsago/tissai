import { expect, describe, it, beforeEach, vi } from "vitest"
import { MockPython } from "#mocks"
import PythonPool from "./PythonPool.js"

vi.spyOn(global.console, "error").mockImplementation(() => {})

describe("PythonPool", () => {
  const SCRIPT_PATH = "/foo/bar.py"
  const QUERY = "A query"
  const RESPONSE = { the: "response" }

  let python: MockPython
  beforeEach(async () => {
    python = MockPython()
  })

  it("starts script on start", async () => {
    PythonPool(SCRIPT_PATH)

    expect(python.PythonShell).toHaveBeenCalledWith(SCRIPT_PATH, expect.anything())
  })

  it("forwards responses to requests", async () => {
    const request = PythonPool(SCRIPT_PATH)
    python.worker.send.mockImplementation(() => python.worker.emit("message", RESPONSE))

    const result = await request(QUERY)

    expect(result).toStrictEqual(RESPONSE)
    expect(python.worker.send).toHaveBeenCalledWith(QUERY)
  })

  it("supports simultaneous queries", async () => {
    const request = PythonPool(SCRIPT_PATH)
    const FIRST_RESPONSE = { first: "reponse" }
    const FIRST_QUERY = "Another query"
    python.worker.send.mockImplementationOnce(() => python.worker.emit("message", FIRST_RESPONSE))
    python.worker.send.mockImplementation(() => python.worker.emit("message", RESPONSE))

    const [result1, result2] = await Promise.all([request(FIRST_QUERY), request(QUERY)])

    expect(result1).toStrictEqual(FIRST_RESPONSE)
    expect(result2).toStrictEqual(RESPONSE)
    expect(python.worker.send).toHaveBeenNthCalledWith(1, FIRST_QUERY)
    expect(python.worker.send).toHaveBeenNthCalledWith(2, QUERY)
  })
})
