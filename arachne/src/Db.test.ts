import { expect, describe, it, beforeEach } from 'vitest'
import { vi, MockedObject } from "vitest"
import Db, { setPg } from './Db.js'

describe('Db', () => {
  let db: ReturnType<typeof Db>
  let fakePg: MockedObject<any>
  beforeEach(() => {
    const Pool = vi.fn()
    const query = vi.fn()
    Pool.mockReturnValue({
      query,
      end: vi.fn(),
    })
    setPg(Pool as any)

    fakePg = { Pool, query }

    db = Db()
  })

	it("initializes pool on create", async () => {
		expect(fakePg.Pool).toHaveBeenCalled()
	})
})
