module.exports = (response) => {
  return response.results.lists.reduce(
    (initialDb, { books, ...list }) =>
      books.reduce((db, book) => {
        const newBook = db[book.primary_isbn13]
          ? {
              ...db[book.primary_isbn13],
              lists: [...db[book.primary_isbn13].lists, list],
            }
          : {
              ...book,
              lists: [list],
            }

        return {
          ...db,
          [book.primary_isbn13]: newBook,
        }
      }, initialDb),
    {},
  )
}
