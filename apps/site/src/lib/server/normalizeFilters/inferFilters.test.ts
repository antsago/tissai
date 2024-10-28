import { describe, test, expect } from "vitest"
import {
  CATEGORY_NODE,
  LABEL_NODE,
  mockDbFixture,
  queries,
  VALUE_NODE,
} from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"
import { inferFilters } from "./inferFilters"

const it = test.extend({ db: mockDbFixture, python: mockPythonFixture })

describe("inferFilters", () => {
  it("infers filters from query", async ({ db, python }) => {
    const query = `${CATEGORY_NODE.name} ${VALUE_NODE.name}`
    const WORDS = [
      {
        isMeaningful: true,
        trailing: " ",
        text: CATEGORY_NODE.name,
        originalText: CATEGORY_NODE.name,
      },
      {
        isMeaningful: true,
        trailing: "",
        text: VALUE_NODE.name,
        originalText: VALUE_NODE.name,
      },
    ]
    python.mockReturnValue(WORDS)
    db.pool.query.mockReturnValueOnce({
      rows: [
        {
          name: CATEGORY_NODE.name,
          id: CATEGORY_NODE.id,
          tally: CATEGORY_NODE.tally,
          children: [
            {
              name: LABEL_NODE.name,
              id: LABEL_NODE.id,
              tally: LABEL_NODE.tally,
              children: [
                {
                  name: VALUE_NODE.name,
                  id: VALUE_NODE.id,
                  tally: VALUE_NODE.tally,
                },
              ],
            },
          ],
        },
      ],
    })

    const result = await inferFilters(query, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({
      category: {
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: [
        {
          label: LABEL_NODE.name,
          id: VALUE_NODE.id,
          name: VALUE_NODE.name,
        },
      ],
    })
    expect(python.worker.send).toHaveBeenCalledWith(query)
    expect(db).toHaveExecuted(
      queries.nodes.match([CATEGORY_NODE.name, VALUE_NODE.name]),
    )
  })

  it("handles no infered category", async ({ db, python }) => {
    const query = "foo bar"
    const WORDS = [
      {
        isMeaningful: true,
        trailing: " ",
        text: "foo",
        originalText: "foo",
      },
      {
        isMeaningful: true,
        trailing: "",
        text: "bar",
        originalText: "bar",
      },
    ]
    python.mockReturnValue(WORDS)
    db.pool.query.mockReturnValueOnce({
      rows: [],
    })

    const result = await inferFilters(query, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({})
  })

  it("handles no infered atributes", async ({ db, python }) => {
    const query = "foo"
    const WORDS = [
      {
        isMeaningful: true,
        trailing: " ",
        text: "foo",
        originalText: "foo",
      },
    ]
    python.mockReturnValue(WORDS)
    db.pool.query.mockReturnValueOnce({
      rows: [
        {
          name: CATEGORY_NODE.name,
          id: CATEGORY_NODE.id,
          tally: CATEGORY_NODE.tally,
          children: null,
        },
      ],
    })

    const result = await inferFilters(query, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({
      category: {
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: [],
    })
  })
})
