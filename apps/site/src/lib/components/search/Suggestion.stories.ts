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
  args: {
    baseUrl: "https://example.com/",
  },
} satisfies Meta<SuggestionTile>
type Story = StoryObj<typeof meta>

export const Full: Story = {
  args: {
    suggestion: {
      label: "Categoría",
      values: [
        {
          id: "1",
          name: "pantalones",
        },
        {
          id: "2",
          name: "vaqueros",
        },
      ],
    },
  },
}

export default meta
