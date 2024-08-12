import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, describe, it } from "vitest"
import { getCallerFilePath, resolveRelativePath } from "./pathUtils.js"

const FILENAME = fileURLToPath(import.meta.url)

describe("getCallerFilePath", () => {
  it("handles stacks without naming information", () => {
    const result = getCallerFilePath()
    expect(result).toBe(FILENAME)
  })

  it("handles stacks with naming information", () => {
    function foo() {
      return getCallerFilePath()
    }
    const result = foo()
    expect(result).toBe(FILENAME)
  })

  it("allows specifying caller depth", () => {
    const result = getCallerFilePath(0)
    expect(result).not.toBe(FILENAME)
  })
})

describe("absolutePath", () => {
  const FILEPATH = "./foo.js"
  const resolvePath = () => resolveRelativePath(FILEPATH)

  it("resolves path relative to caller", () => {
    const expected = path.resolve(import.meta.dirname, FILEPATH)
    const result = resolvePath()
    expect(result).toBe(expected)
  })
})
