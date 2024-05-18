import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { PythonShell } from "python-shell"

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const model = new PythonShell(`${currentDirectory}/embedder.py`, {
	mode: "text",
	pythonOptions: ["-u"], // get print results in real-time
})

const promise = new Promise((res, rej) => {
	model.on("message", (message: string) => {
		res(message)
	})
})

model.send("A query")

const m = await promise

console.log(m)

model.kill()
