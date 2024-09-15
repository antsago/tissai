import { TaskContext, TestContext } from "vitest"
import { MockOra } from "./MockOra.js"

export type mockOraFixture = MockOra

export const mockOraFixture = async (
  {}: TaskContext & TestContext,
  use: (pg: mockOraFixture) => any,
) => {
  const { MockOra } = await import("./MockOra.js")
  const ora = MockOra()

  use(ora)
}
