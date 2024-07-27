import type { CustomMatchers } from "@tissai/db/mocks"

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers {}
}
