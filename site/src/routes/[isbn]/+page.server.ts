import type { PageServerLoad } from './$types'
import books from '../../../../data/books.json'

export const load: PageServerLoad = ({ params }) => {
  const book = (books as any)[params.isbn]

  return {
    isbn: book.primary_isbn13,
    author: book.author,
    title: book.title,
  } 
}