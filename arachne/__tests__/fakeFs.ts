import { vi, MockedObject } from "vitest"
import { setFs } from "../src/Cache.js"

export type MockFs = MockedObject<Parameters<typeof setFs>[0]>
export function FakeFs() {
  const fs = {
    readdir: vi.fn(),
    readFile: vi.fn(),
  } as MockFs

	setFs(fs)

	return fs
}
