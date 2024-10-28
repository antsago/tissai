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
      label: "categoría",
      values: [
        {
          href: "/search?foo=bar",
          name: "pantalones",
        },
        {
          href: "/search?bar=foo",
          name: "vaqueros",
        },
        {
          href: "/search?bar=foo",
          name: "vaquero",
        },
        {
          href: "/search?bar=foo",
          name: "jean",
        },
        {
          href: "/search?bar=foo",
          name: "jeans",
        },
      ],
    },
  },
}

export const Shorts: Story = {
  args: {
    suggestion: {
      label: "categoría",
      values: [
        {
          href: "/search?bar=foo",
          name: "jean",
        },
        {
          href: "/search?bar=foo",
          name: "jeans",
        },
      ],
    },
  },
}

export default meta
