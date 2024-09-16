import { expect, describe, it } from "vitest"
import { getCallerDirectory, extractDirectory } from "./pathUtils.js"

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

describe("getCallerDirectory", () => {
  const resolvePath = () => getCallerDirectory()

  it("resolves path relative to caller", () => {
    const result = resolvePath()
    expect(result).toBe(import.meta.dirname)
  })
})
