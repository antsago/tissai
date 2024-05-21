import { expect, describe, it, beforeEach, vi } from 'vitest'
import { Db } from '../src/Db'

describe('DB', () => {
  it('inserts traces', async () => {
    const masterDb = Db()
    await masterDb.query('CREATE DATABASE test;')
    const testDb = Db('test')
    await testDb.query(`
      CREATE TABLE traces (
        id              uuid PRIMARY KEY,
        timestamp       timestamp with time zone,
        page_of_origin  uuid,
        object_table    text,
        object_id       text
      );`
    )

    const TRACE = {
      pageId: "5f4f389d-cc00-4bdf-a484-278e3b18975c",
      objectTable: "sellers",
      objectId: "test seller",
    }
    await testDb.insert.trace(TRACE.pageId, TRACE.objectTable, TRACE.objectId)

    const traces = await testDb.query('SELECT * from traces;')

    expect(traces).toStrictEqual([{
      id: expect.any(String),
      page_of_origin: TRACE.pageId,
      object_table: TRACE.objectTable,
      object_id: TRACE.objectId,
      timestamp: expect.any(Date),
    }])

    await testDb.close()
    await masterDb.query('DROP DATABASE test;')
    await masterDb.close()
  })
})