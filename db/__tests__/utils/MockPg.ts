import { vi } from "vitest"
import { setPg } from "../../src"

function mockedCursor() {
  const close = vi.fn()
  const read = vi.fn().mockResolvedValue([])

  return { close, read }
}

function mockedClient(cursor: ReturnType<typeof mockedCursor>) {
  const release = vi.fn()
  const query = vi.fn().mockResolvedValue(cursor)

  return { release, query }
}

function mockedPool(client: ReturnType<typeof mockedClient>) {
  const connect = vi.fn().mockReturnValue(client)
  const query = vi.fn().mockResolvedValue({ rows: [] })
  const end = vi.fn()

  return { connect, query, end }
}

export function MockPg() {
  const cursor = mockedCursor()
  const client = mockedClient(cursor)
  const pool = mockedPool(client)

  const Cursor = vi.fn()
  const Pool = vi.fn().mockReturnValue(pool)

  setPg(Pool as any, Cursor as any)

  return { Pool, Cursor, pool, client, cursor }
}
export type MockPg = ReturnType<typeof MockPg>
