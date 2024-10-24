import type { Meta, StoryObj } from "@storybook/svelte"
import ProductSnippet from "./ProductSnippet.svelte"

const meta = {
  title: "Product details/ProductSnippet",
  component: ProductSnippet,
  argTypes: {
    product: {
      control: { type: "object" },
    },
  },
} satisfies Meta<ProductSnippet>
type Story = StoryObj<typeof meta>

const FULL_DATA = {
  id: "similar-1",
  title: "Puma Pantalones de chandal",
  image: "/similar1.jpg",
}


export const Full: Story = {
  args: {
    product: FULL_DATA,
  },
}
export const NoImage: Story = {
  args: {
    product: {
      ...FULL_DATA,
      image: null,
    },
  },
}

export default meta
