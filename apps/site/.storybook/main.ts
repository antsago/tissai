import type { StorybookConfig } from "@storybook/sveltekit"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|ts|svelte)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/sveltekit",
    options: {},
  },
  features: {
    viewportStoryGlobals: true,
    backgroundsStoryGlobals: true,
  },
  staticDirs: ['./assets'],
}
export default config
