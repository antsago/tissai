import type { Handle } from "./$types"
import { Products } from "$lib/server"

let products: Products
export const handle: Handle = async ({ event, resolve }) => {
	if (!products) {
		products = Products()
	}
	event.locals.products = products
	return resolve(event)
}
