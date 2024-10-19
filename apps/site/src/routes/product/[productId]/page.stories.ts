import type { Meta, StoryObj } from "@storybook/svelte"
import Page from "./+page.svelte"

const meta = {
  title: "pages/Product Details",
  component: Page,
  argTypes: {
    data: {
      control: { type: "object" },
    },
  },
} satisfies Meta<Page>
type Story = StoryObj<typeof meta>

export const TitleOnly: Story = {
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
