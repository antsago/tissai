import type { PageServerLoad } from "./$types"
import books from "../../../../data/books.json"
import relationships from "../../../../data/relationships.json"

export const load: PageServerLoad = ({ params }) => {
	const book = (books as any)[params.id]
	const recommended = (relationships as any)[params.id]

	return {
		book,
		recommended: [...recommended]
			.sort((a: any, b: any) => b.score - a.score)
			.map((r: any) => r.isbn),
	}
}
