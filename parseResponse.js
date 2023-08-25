module.exports = (response) => {
    const { books, ...list } = response.results.lists[0]
    return books.reduce((db, book) => ({
        ...db,
        [book.primary_isbn13]: {
            ...book,
            lists: [list]
        }
    }), {})
}