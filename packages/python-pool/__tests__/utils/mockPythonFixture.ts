import { TaskContext, TestContext } from "vitest"
import { MockPython } from "./MockPython.js"

export type mockPythonFixture = MockPython

export const mockPythonFixture = async (
  {}: TaskContext & TestContext,
  use: (pg: mockPythonFixture) => any,
) => {
  const { MockPython } = await import("./MockPython.js")
  const python = MockPython()

  use(python)
}
