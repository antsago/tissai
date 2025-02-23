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
      { text: "modelo: 501®", emphasis: "primary", href: "/foo" },
      { text: "categoría", emphasis: "secondary", href: "/foo" },
      { text: "cordones con cuerdas", emphasis: "default", href: "/foo" },
      { text: "mezclilla", href: "/foo" },
    ],
  },
}
export const NonDense: Story = {
  args: {
    dense: false,
    chips: [
      { text: "modelo: 501®" },
      { text: "categoría" },
      { text: "cordones con cuerdas" },
      { text: "mezclilla" },
      { text: "a fifth very long argument" },
    ],
  },
}
export const NonDenseLinks: Story = {
  args: {
    dense: false,
    chips: [
      { text: "modelo: 501®", href: "/foo" },
      { text: "categoría", href: "/foo" },
      { text: "cordones con cuerdas", href: "/foo" },
      { text: "mezclilla", href: "/foo" },
      { text: "a fifth very long argument", href: "/foo" },
    ],
  },
}
export const WithExtraHeight: Story = {
  args: {
    class: "min-h-[200px]",
    chips: [
      { text: "modelo: 501®" },
      { text: "categoría" },
      { text: "cordones con cuerdas" },
      { text: "mezclilla" },
    ],
  },
}
export const Empty: Story = {
  args: {
    chips: [],
  },
}

export default meta
