import type { Meta, StoryObj } from "@storybook/svelte"
import OfferList from "./OfferList.svelte"

const meta = {
  title: "Product details/OfferList",
  component: OfferList,
  argTypes: {
    offers: {
      control: { type: "object" },
    },
  },
  args: {
    headerId: "offers-id",
  },
} satisfies Meta<OfferList>
type Story = StoryObj<typeof meta>

const OFFER = {
  url: "https://example.com/foo.html",
  price: 10.99,
  currency: "EUR",
  seller: "seller",
  site: {
    name: "site",
    icon: "/shop.ico",
  },
}

export const MultipleImages: Story = {
  args: {
    offers: [OFFER, OFFER],
  },
}
export const SingleImage: Story = {
  args: {
    offers: [OFFER],
  },
}
export const NoImages: Story = {
  args: {
    offers: [],
  },
}
export const Null: Story = {
  args: {
    offers: null,
  },
}

export default meta
