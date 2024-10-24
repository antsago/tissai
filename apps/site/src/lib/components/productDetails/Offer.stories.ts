import type { Meta, StoryObj } from "@storybook/svelte"
import Offer from "./Offer.svelte"

const meta = {
  title: "Product details/Offer",
  component: Offer,
  argTypes: {
    offer: {
      control: { type: "object" },
    },
  },
} satisfies Meta<Offer>
type Story = StoryObj<typeof meta>

const FULL_DATA = {
  url: "https://example.com/foo.html",
  price: 10.99,
  currency: "EUR",
  seller: "seller",
  site: {
    name: "site",
    icon: "/shop.ico",
  },
}

export const Full: Story = {
  args: {
    offer: FULL_DATA,
  },
}
export const NoPrice: Story = {
  args: {
    offer: {
      ...FULL_DATA,
      price: null,
    },
  },
}
export const NoCurrency: Story = {
  args: {
    offer: {
      ...FULL_DATA,
      currency: null,
    },
  },
}
export const NoSeller: Story = {
  args: {
    offer: {
      ...FULL_DATA,
      seller: null,
    },
  },
}
export const Minimal: Story = {
  args: {
    offer: {
      url: FULL_DATA.url,
      price: null,
      currency: null,
      seller: null,
      site: FULL_DATA.site,
    },
  },
}

export default meta
