import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { PythonShell } from "python-shell"
import { expect, describe, it, beforeEach } from 'vitest'

it("works", async () => {
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
	model.kill()

	expect(m).not.toBe("console.log(m)")
}, 30000)
