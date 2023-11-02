import type { PageServerLoad } from "./$types"
import books from "../../../../data/books.json"
import relationships from "../../../../data/relationships.json"

export const load: PageServerLoad = ({ params }) => {
	const book = (books as any)[params.isbn]
	const recommended = (relationships as any)[params.isbn]

	return {
		book,
		recommended: [...recommended]
			.sort((a: any, b: any) => b.score - a.score)
			.map((r: any) => r.isbn),
	}
}
