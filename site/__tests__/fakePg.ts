import { vi } from "vitest"
import { setPg } from "../src/lib/server/db"

export function Fake() {
	const Pool = vi.fn()
	const query = vi.fn()
	Pool.mockReturnValue({
		query,
		end: vi.fn(),
	})

	setPg({ Pool })

	return {
		Pool,
		query,
	}
}
export type Fake = ReturnType<typeof Fake>
