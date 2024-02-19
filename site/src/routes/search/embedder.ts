import { PythonShell } from "python-shell"

type Embedder = {
	embed: (query: string) => Promise<string>
}

function Embedder(): Embedder {
	const echo = new PythonShell("./src/routes/search/echo.py", {
		mode: "text",
		pythonOptions: ["-u"], // get print results in real-time
	})

	type Resolve = (message: string) => void
	const promises: Resolve[] = []
	echo.on("message", (message) => {
		const resolve = promises.shift()
		resolve?.(message)
	})
	
	return {
		embed: async (query) => {
			const promise = new Promise<string>((res) => promises.push(res))

			echo.send(query)
			return promise
		},
	}
}

export default Embedder
