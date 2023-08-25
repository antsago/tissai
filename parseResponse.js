module.exports = (response) => {
    const { books, ...list } = response.results.lists[0]
    const book = books[0]

    return {
        [book.primary_isbn13]: {
            ...book,
            lists: [list]
        }
    }
}