import { vi } from "vitest"
import { setPg } from "../src/Db.js"

export function MockPg() {
  const Pool = vi.fn()
  const query = vi.fn()
  Pool.mockReturnValue({
    query,
    end: vi.fn(),
  })
  setPg(Pool as any)

  return { Pool, query }
}
export type MockPg = ReturnType<typeof MockPg>
