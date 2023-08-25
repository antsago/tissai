const parseResponse = require("./parseResponse")

describe("parseReponse", () => {
  const book = { other: "book fields", primary_isbn13: "456" }
  const book2 = { other: "book 2 fields", primary_isbn13: "789" }
  const list = { list_id: 123, other: "fields" }
  const list2 = { list_id: 456, other: "list2 fields" }

  it("converts reponse into db of books", () => {
    const response = { results: { lists: [{ ...list, books: [book] }] } }

    const result = parseResponse(response)

    expect(result).toStrictEqual({
      [book.primary_isbn13]: {
        ...book,
        lists: [list],
      },
    })
  })

  it("handles several books", () => {
    const response = {
      results: { lists: [{ ...list, books: [book, book2] }] },
    }

    const result = parseResponse(response)

    expect(result).toStrictEqual({
      [book.primary_isbn13]: {
        ...book,
        lists: [list],
      },
      [book2.primary_isbn13]: {
        ...book2,
        lists: [list],
      },
    })
  })

  it("handles several lists", () => {
    const response = {
      results: {
        lists: [
          { ...list, books: [book] },
          { ...list2, books: [book2] },
        ],
      },
    }

    const result = parseResponse(response)

    expect(result).toStrictEqual({
      [book.primary_isbn13]: {
        ...book,
        lists: [list],
      },
      [book2.primary_isbn13]: {
        ...book2,
        lists: [list2],
      },
    })
  })
})
