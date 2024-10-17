import type { Preview } from "@storybook/svelte"
import "../src/app.css"
import Page from "../src/lib/components/Page.svelte"

const preview: Preview = {
  decorators: [() => Page as any],
}

export default preview
