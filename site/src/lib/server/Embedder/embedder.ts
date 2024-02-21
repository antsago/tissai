import { dirname } from "path"
import { fileURLToPath } from "url"
import { PythonShell } from "python-shell"

export type Embedding = number[]
type Resolver = (embedding: Embedding) => void
type Embedder = {
	embed: (query: string) => Promise<number[]>
}

function Embedder(): Embedder {
	const resolvers: Resolver[] = []
	const currentDirectory = dirname(fileURLToPath(import.meta.url))
	const model = new PythonShell(`${currentDirectory}/embedder.py`, {
		mode: "text",
		pythonOptions: ["-u"], // get print results in real-time
	})

	model.on("message", (message: string) => {
		const embedding = message
			.slice(1, -1)
			.split(" ")
			.filter((n) => n !== "")
			.map((n) => parseFloat(n))

		resolvers.shift()?.(embedding)
	})

	return {
		embed: async (query) => {
			const promise = new Promise<Embedding>((res) => resolvers.push(res))

			model.send(query)
			return promise
		},
	}
}

export default Embedder
