import type { Meta, StoryObj } from "@storybook/svelte"
import ProductTile from "./ProductTile.svelte"

const meta = {
  title: "Search/ProductTile",
  component: ProductTile,
  argTypes: {
    product: {
      control: { type: "object" },
    },
  },
} satisfies Meta<ProductTile>
type Story = StoryObj<typeof meta>

export const Full: Story = {
  args: {
    product: {
      id: "similar-1",
      title: "Puma Pantalones de chandal",
      image: "/product1.jpg",
      brand: {
        name: "puma",
        logo: "/logo.jpg",
      },
      price: 10.99,
    },
  },
}

export const BrandWithoutLogo: Story = {
  args: {
    product: {
      id: "similar-1",
      title: "Puma Pantalones de chandal",
      image: "/product1.jpg",
      brand: {
        name: "puma",
      },
      price: 10.99,
    },
  },
}

export const ProductWithoutBrand: Story = {
  args: {
    product: {
      id: "similar-1",
      title: "Puma Pantalones de chandal",
      image: "/product1.jpg",
      brand: null,
      price: 10.99,
    },
  },
}

export const ProductWithoutPrice: Story = {
  args: {
    product: {
      id: "similar-1",
      title: "Puma Pantalones de chandal",
      image: "/product1.jpg",
      brand: {
        name: "puma",
        logo: "/logo.jpg",
      },
      price: null,
    },
  },
}

export const Minimal: Story = {
  args: {
    product: {
      id: "similar-1",
      title: "Puma Pantalones de chandal",
      image: null,
      brand: null,
      price: null,
    },
  },
}

export default meta
