import type { Meta, StoryObj } from "@storybook/svelte"
import Page from "./+page.svelte"

const meta = {
  title: "pages/ProductDetails",
  component: Page,
  argTypes: {
    data: {
      control: { type: "object" },
    },
  },
} satisfies Meta<Page>
type Story = StoryObj<typeof meta>

export const TitleOnly: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" }
  },
  args: {
    data: {
      title: "Product title", 
      brand: undefined,
      category: null,
      description: undefined,
      images: undefined,
      attributes: [],
      similar: [],
      offers: [],
    },
  },
}

export default meta
