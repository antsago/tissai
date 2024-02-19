import type { PageServerLoad } from "./$types"
import Embedder from "./embedder"

const embedder = Embedder()

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q") || ""
	const concated = await embedder.embed(query)

	return {
		concated,
		query,
	}
}
