import { PythonShell } from "python-shell"

function Embedder() {
	const echo = new PythonShell("./src/routes/search/echo.py", {
		mode: "text",
		pythonOptions: ["-u"], // get print results in real-time
	})
	let resolve: (message: string) => void
	let reject
	echo.on("message", (message) => {
		resolve(message)
	})
	echo.on("close", () => {
		console.log("finished")
	})
	
	return {
		embed: async (query:string) => {
			const promise = new Promise<string>((res, rej) => {
				resolve = res
				reject = rej
			})
			
			echo.send(query)
			return promise
		},
	}
}

export default Embedder
