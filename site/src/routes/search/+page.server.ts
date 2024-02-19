import type { PageServerLoad } from "./$types"
import { PythonShell } from "python-shell"

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

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q") || ""
	const p = new Promise((res, rej) => {
		resolve = res
		reject = rej
	})
	
	echo.send(query)
	const concated = await p

	return {
		concated,
		query,
	}
}
