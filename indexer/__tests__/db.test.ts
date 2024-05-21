import { expect, describe, it, beforeEach, afterEach } from 'vitest'
import { Db, TRACES, SELLERS } from '../src/Db/index.js'
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
      objectTable: SELLERS.toString(),
      objectId: OFFER.seller,
    }

    await testDb.traces.create(TRACE.pageId, TRACE.objectTable, TRACE.objectId)

    const traces = await testDb.query(`SELECT * FROM ${TRACES};`)
    expect(traces).toStrictEqual([{
      id: expect.any(String),
      page_of_origin: TRACE.pageId,
      object_table: TRACE.objectTable,
      object_id: TRACE.objectId,
      timestamp: expect.any(Date),
    }])
  })

  it('inserts sellers', async () => {
    await testDb.sellers.create(PAGE.id, OFFER.seller)

    const sellers = await testDb.query(`SELECT * FROM ${SELLERS};`)
    const traces = await testDb.query(`SELECT * FROM ${TRACES};`)

    expect(sellers).toStrictEqual([{ name: OFFER.seller }])
    expect(traces).toStrictEqual([{
      id: expect.any(String),
      page_of_origin: PAGE.id,
      object_table: SELLERS.toString(),
      object_id: OFFER.seller,
      timestamp: expect.any(Date),
    }])
  })
})