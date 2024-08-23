import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, describe, it } from "vitest"
import { resolveRelativePath, extractDirectory } from "./pathUtils.js"

describe("extractDirectory", () => {
  const DIRECTORY = "/parent/folder"
  it.each([
    {
      title: "handles naming and file url",
      line: `    at caller (file://${DIRECTORY}/file.js:3:17)`,
    },
    {
      title: "handles naming and file path",
      line: `    at caller (${DIRECTORY}/file.js:3:17)`,
    },
    {
      title: "handles no naming and file url",
      line: `    at file://${DIRECTORY}/file.js:3:17`,
    },
    {
      title: "handles no naming and file path",
      line: `    at ${DIRECTORY}/file.js:3:17`,
    },
  ])("$title", ({ line }) => {
    const result = extractDirectory(line)
    expect(result).toBe(DIRECTORY)
  })
})

describe("resolveRelativePath", () => {
  const FILEPATH = "./foo.js"
  const resolvePath = () => resolveRelativePath(FILEPATH)

  it("resolves path relative to caller", () => {
    const expected = path.resolve(import.meta.dirname, FILEPATH)
    const result = resolvePath()
    expect(result).toBe(expected)
  })
})
