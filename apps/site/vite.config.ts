import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      external: ["@tissai/db", "@tissai/python-pool", "@tissai/tokenizer"],
    }
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "jsdom",
    testTimeout: 10000,
  },
})
