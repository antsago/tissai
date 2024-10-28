import type { Meta, StoryObj } from "@storybook/svelte"
import SuggestionTile from "./SuggestionTile.svelte"

const meta = {
  title: "Search/SuggestionTile",
  component: SuggestionTile,
  argTypes: {
    suggestion: {
      control: { type: "object" },
    },
  },
} satisfies Meta<SuggestionTile>
type Story = StoryObj<typeof meta>

export const Full: Story = {
  args: {
    suggestion: {
      label: "Categoría",
      values: [
        {
          href: "/search?foo=bar",
          name: "pantalones",
        },
        {
          href: "/search?bar=foo",
          name: "vaqueros",
        },
      ],
    },
  },
}

export default meta
