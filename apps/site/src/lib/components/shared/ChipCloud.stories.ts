import type { Meta, StoryObj } from "@storybook/svelte"
import ChipCloud from "./ChipCloud.svelte"

const meta = {
  title: "Shared/ChipCloud",
  component: ChipCloud,
  argTypes: {
    chips: {
      control: { type: "object" },
    },
  },
  args: {
    background: "bg-stone-100",
  },
} satisfies Meta<ChipCloud>
type Story = StoryObj<typeof meta>

export const AllEmphasis: Story = {
  args: {
    chips: [
      { text: "modelo: 501®", emphasis: "primary" },
      { text: "categoría", emphasis: "secondary" },
      { text: "cordones con cuerdas", emphasis: "default" },
      { text: "mezclilla" },
    ],
  },
}
export const WithLinks: Story = {
  args: {
    chips: [
      { text: "modelo: 501®", emphasis: "primary", href:"/foo" },
      { text: "categoría", emphasis: "secondary", href:"/foo" },
      { text: "cordones con cuerdas", emphasis: "default", href:"/foo" },
      { text: "mezclilla", href:"/foo" },
    ],
  },
}
export const Empty: Story = {
  args: {
    chips: [],
  },
}

export default meta
