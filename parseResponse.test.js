const parseResponse = require('./parseResponse')

describe('parseReponse', () => {
    const book = { other: "book fields", primary_isbn13: "456" }
    const list = { list_id: 123, other: "fields" }

    it('converts reponse into db of books', () => {
        const response = { results: { lists: [ { ...list, books: [book] } ] } }

        const result = parseResponse(response)

        expect(result).toStrictEqual({
            [book.primary_isbn13]: {
                ...book,
                lists: [list]
            }
        })
    })
})