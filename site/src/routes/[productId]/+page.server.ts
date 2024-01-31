import type { PageServerLoad } from "./$types"
import products from "../../../../data/products.json"

export const load: PageServerLoad = ({ params }) => {
	const product = products.find((p) => p.id === params.productId)

	return product
}
