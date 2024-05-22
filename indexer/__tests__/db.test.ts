import {
  expect,
  describe,
  it,
  beforeEach,
  afterEach,
  vi,
  afterAll,
} from "vitest"
import { Db, TRACES, SELLERS } from "../src/Db/index.js"
import { OFFER, PAGE } from "#mocks"

const TEST_TABLE = "test"
describe("DB", () => {
  const masterDb = Db()
  vi.stubEnv("PG_DATABASE", TEST_TABLE)

  let db: Db
  beforeEach(async () => {
    vi.resetModules()

    await masterDb.query(`CREATE DATABASE ${TEST_TABLE};`)

    db = Db()
    await db.initialize()
  })

  afterEach(async () => {
    await db.close()

    await masterDb.query(`DROP DATABASE ${TEST_TABLE};`)
  })

  afterAll(async () => {
    await masterDb.close()
  })

  it("inserts traces", async () => {
    const TRACE = {
      pageId: PAGE.id,
      objectTable: SELLERS.toString(),
      objectId: OFFER.seller,
    }

    await db.traces.create(TRACE.pageId, TRACE.objectTable, TRACE.objectId)

    const traces = await db.query(`SELECT * FROM ${TRACES};`)
    expect(traces).toStrictEqual([
      {
        id: expect.any(String),
        page_of_origin: TRACE.pageId,
        object_table: TRACE.objectTable,
        object_id: TRACE.objectId,
        timestamp: expect.any(Date),
      },
    ])
  })

  it("inserts sellers", async () => {
    await db.sellers.create(PAGE.id, OFFER.seller)

    const sellers = await db.query(`SELECT * FROM ${SELLERS};`)
    const traces = await db.query(`SELECT * FROM ${TRACES};`)

    expect(sellers).toStrictEqual([{ name: OFFER.seller }])
    expect(traces).toStrictEqual([
      {
        id: expect.any(String),
        page_of_origin: PAGE.id,
        object_table: SELLERS.toString(),
        object_id: OFFER.seller,
        timestamp: expect.any(Date),
      },
    ])
  })
})
