import type { Meta, StoryObj } from "@storybook/svelte"
import Filters from "./Filters.svelte"

const meta = {
  title: "Search/Filters",
  component: Filters,
  argTypes: {
    filters: {
      control: { type: "object" },
    },
  },
} satisfies Meta<Filters>
type Story = StoryObj<typeof meta>

export const Full: Story = {
  args: {
    filters: {
      brand: "Eg",
      max: 15.99,
      min: 14,
      category: {
        id: "category-id",
        name: "pantalones",
      },
      attributes: [
        { id: "value-1-id", label: "modelo", name: "501®" },
        { id: "value-2-id", label: "cordones", name: "cordones" },
      ],
    },
  },
}

export const NoMinPrice: Story = {
  args: {
    filters: {
      max: 15.99,
    },
  },
}

export const NoMaxPrice: Story = {
  args: {
    filters: {
      min: 14,
    },
  },
}

export const ZeroPrice: Story = {
  args: {
    filters: {
      max: 0,
      min: 0,
    },
  },
}

export const Empty: Story = {
  args: {
    filters: {},
  },
}

export default meta
