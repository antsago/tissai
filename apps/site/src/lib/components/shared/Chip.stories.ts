import type { Meta, StoryObj } from "@storybook/svelte"
import Chip from "./Chip.svelte"

const meta = {
  title: "Shared/Chip",
  component: Chip,
  argTypes: {
    emphasis: {
      options: ["primary", "secondary", "default"],
      control: { type: "select" },
    },
  },
  args: {
    background: "bg-stone-100",
  },
} satisfies Meta<Chip>
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    emphasis: "primary",
  },
}

export default meta

export const Secondary: Story = {
  args: {
    emphasis: "secondary",
  },
}

export const Default: Story = {
  args: {},
}
