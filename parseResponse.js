module.exports = (response) => {
  return response.results.lists.reduce(
    (initialDb, { books, ...list }) =>
      books.reduce(
        (db, book) => ({
          ...db,
          [book.primary_isbn13]: {
            ...book,
            lists: [list],
          },
        }),
        initialDb,
      ),
    {},
  )
}
