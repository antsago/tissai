import type { Meta, StoryObj } from "@storybook/svelte"
import Page from "./+page.svelte"

const meta = {
  title: "Search/page",
  component: Page,
  argTypes: {
    data: {
      titles: { control: { type: "object" } },
      filters: { control: { type: "object" } },
    },
  },
  globals: {
    backgrounds: {
      value: "stone50",
    },
  },
  parameters: {
    sveltekit_experimental: {
      stores: {
        page: {
          url: {
            href: "https://example.com/page?foo=bar",
          },
        },
      },
    },
  },
} satisfies Meta<Page>
type Story = StoryObj<typeof meta>

const TILES = [
  {
    id: "similar-1",
    title: "Puma Pantalones de chandal",
    image: "/product1.jpg",
    brand: {
      name: "puma",
      logo: "/logo.jpg",
    },
    price: 10.99,
    currency: "EUR",
  },
  {
    label: "categoría",
    values: [
      {
        name: "Vaqueros",
        href: "/foo",
      },
      { name: "Botines", href: "/bar" },
    ],
  },
]

export const Full: Story = {
  args: {
    data: {
      tiles: TILES,
      filters: {},
    },
  },
}
export const NoFilters: Story = {
  args: {
    data: {
      filters: {},
      tiles: TILES,
    },
  },
}
export const Empty: Story = {
  args: {
    data: {
      filters: {},
      tiles: [],
    },
  },
}

export default meta
