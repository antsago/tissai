import type { Meta, StoryObj } from "@storybook/svelte"
import ImageCarousel from "./ImageCarousel.svelte"

const meta = {
  title: "Product details/ImageCarousel",
  component: ImageCarousel,
  argTypes: {
    images: {
      control: { type: "object" },
    },
  },
  args: {
    alt: "The title of the product",
  },
} satisfies Meta<ImageCarousel>
type Story = StoryObj<typeof meta>

export const MultipleImages: Story = {
  args: {
    images: ["/product1.jpg", "/product2.jpg"],
  },
}
export const SingleImage: Story = {
  args: {
    images: ["/product1.jpg"],
  },
}
export const NoImages: Story = {
  args: {
    images: [],
  },
}
export const Null: Story = {
  args: {
    images: null,
  },
}

export default meta
