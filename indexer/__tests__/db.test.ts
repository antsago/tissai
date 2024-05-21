import { expect, describe, it, beforeEach, afterEach } from 'vitest'
import { Db } from '../src/Db/index.js'
import { OFFER, PAGE } from '#mocks'

const TEST_TABLE = "test"
describe('DB', () => {
  let testDb: Db
  let masterDb: Db
  beforeEach(async () => {
    masterDb = Db()
    await masterDb.query(`CREATE DATABASE ${TEST_TABLE};`)

    testDb = Db(TEST_TABLE)
    await testDb.initialize()
  })

  afterEach(async () => {
    await testDb.close()

    await masterDb.query(`DROP DATABASE ${TEST_TABLE};`)
    await masterDb.close()
  })

  it('inserts traces', async () => {
    const TRACE = {
      pageId: PAGE.id,
      objectTable: "sellers",
      objectId: OFFER.seller,
    }

    await testDb.insert.trace(TRACE.pageId, TRACE.objectTable, TRACE.objectId)

    const traces = await testDb.query('SELECT * FROM traces;')
    expect(traces).toStrictEqual([{
      id: expect.any(String),
      page_of_origin: TRACE.pageId,
      object_table: TRACE.objectTable,
      object_id: TRACE.objectId,
      timestamp: expect.any(Date),
    }])
  })

  it('inserts sellers', async () => {
    await testDb.insert.seller(PAGE.id, OFFER.seller)

    const sellers = await testDb.query('SELECT * FROM sellers;')
    const traces = await testDb.query('SELECT * FROM traces;')

    expect(sellers).toStrictEqual([{ name: OFFER.seller }])
    expect(traces).toStrictEqual([{
      id: expect.any(String),
      page_of_origin: PAGE.id,
      object_table: "sellers",
      object_id: OFFER.seller,
      timestamp: expect.any(Date),
    }])
  })
})