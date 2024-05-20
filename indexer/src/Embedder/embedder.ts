import { dirname } from "path"
import { fileURLToPath } from "url"
import { PythonShell } from "python-shell"

export type AugmentedData = { embedding: number[], category: string, tags: string[] }
type Resolver = (embedding: AugmentedData) => void
type Embedder = {
	embed: (query: string) => Promise<AugmentedData>
}

function Embedder(): Embedder {
	const resolvers: Resolver[] = []
	const currentDirectory = dirname(fileURLToPath(import.meta.url))
	const model = new PythonShell(`${currentDirectory}/embedder.py`, {
		mode: "json",
		pythonOptions: ["-u"], // get print results in real-time
	})

	model.on("message", (message: AugmentedData) => {
		resolvers.shift()?.(message)
	})

	return {
		embed: async (query) => {
			const promise = new Promise<AugmentedData>((res) => resolvers.push(res))

			model.send(query)
			return promise
		},
	}
}

export default Embedder
