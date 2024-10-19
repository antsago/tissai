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

export const Full: Story = {
  args: {
    data: {
      title: "Product title", 
      brand: {
        name: "brand",
        logo: "logo.jpg",
      },
      category: "category",
      description: "The product description",
      images: ["foo.jpg", "faa.jpg"],
      attributes: [{ label: "label", value: "value" }],
      similar: [{
        id: "asdfasdf",
        title: "Similar product",
        image: "similar.jpg",
      }],
      offers: [
        {
          url: "foo.html",
          price: 10.99,
          currency: "eur",
          seller: "seller",
          site: {
            name: "site",
            icon: "siteicon.jpg",
          }
        }
      ],
    },
  },
}
export const Minimal: Story = {
  args: {
    data: {
      title: "Product title", 
      brand: null,
      category: null,
      description: null,
      images: null,
      attributes: null,
      similar: null,
      offers: null,
    },
  },
}

export default meta
