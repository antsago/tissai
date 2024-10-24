import type { Meta, StoryObj } from "@storybook/svelte"
import Filters from "./Filters.svelte"

const meta = {
  title: "search/Filters",
  component: Filters,
  argTypes: {
    filters: {
      control: { type: "object" },
    },
  },
  globals: {
    backgrounds: {
      value: "slate50",
    },
  },
} satisfies Meta<Filters>
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    filters: {},
  },
}

export const Brands: Story = {
  args: {
    filters: {
      brand: "Eg",
    },
  },
}

export default meta
