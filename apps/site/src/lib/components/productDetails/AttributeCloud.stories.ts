import type { Meta, StoryObj } from "@storybook/svelte"
import AttributeCloud from "./AttributeCloud.svelte"

const meta = {
  title: "Product details/AttributeCloud",
  component: AttributeCloud,
  argTypes: {
    category: {
      control: { type: "text" },
    },
    attributes: {
      control: { type: "object" },
    },
  },
  args: {
    background: "bg-stone-200",
  },
  globals: {
    backgrounds: {
      value: "stone200",
    }
  }
} satisfies Meta<AttributeCloud>
type Story = StoryObj<typeof meta>

export const CategoryAndAttributes: Story = {
  args: {
    category: "pantalon",
    attributes: [
      { label: "modelo", value: "501®" },
      { label: "cordones", value: "cordones" },
    ],
  },
}
export const CategoryOnly: Story = {
  args: {
    category: "pantalon",
    attributes: null,
  },
}
export const EmptyArray: Story = {
  args: {
    category: "pantalon",
    attributes: [],
  },
}
export const AllNull: Story = {
  args: {
    category: null,
    attributes: null,
  },
}

export default meta
