import { vi, MockedObject } from "vitest"
import { setFs } from "../src/Cache.js"

export type FakeFs = MockedObject<Parameters<typeof setFs>[0]>
export function FakeFs() {
  const fs = {
    readdir: vi.fn(),
    readFile: vi.fn(),
  } as FakeFs

	setFs(fs)

	return fs
}
