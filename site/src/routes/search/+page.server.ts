import type { PageServerLoad } from "./$types"
import { PythonShell } from "python-shell"

let concated = ""
const echo = new PythonShell("./src/routes/search/echo.py", {
	mode: "text",
	pythonOptions: ["-u"], // get print results in real-time
})
echo.on("message", (message) => {
	concated = message
})
echo.on("close", () => {
	console.log("finished")
})
process.stdin.on("data", (data) => {
	echo.send(data.toString())
})

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get("q") || ""
	echo.send(query)

	return {
		concated,
		query,
	}
}
