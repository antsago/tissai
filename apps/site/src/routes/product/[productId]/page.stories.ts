import type { Meta, StoryObj } from "@storybook/svelte"
import Page from "./+page.svelte"

const meta = {
  title: "pages/Product Details",
  component: Page,
  argTypes: {
    data: {
      control: { type: "object" },
    },
  },
} satisfies Meta<Page>
type Story = StoryObj<typeof meta>

export const Full: Story = {
  args: {
    data: {
      title: "Puma Pantalones de chandal",
      brand: {
        name: "puma",
        logo: "/logo.jpg",
      },
      category: "category",
      description: "Del sofá a la calle, refréscate con estos Core Sportswear Joggers para hombre de PUMA. En una combinación de colores Black, estos pantalones exclusivos de JD están confeccionados con una mezcla de algodón y poliéster reciclado para una comodidad afelpada. Tienen una pretina ajustable con cordón, tobillos con puños y bolsillos laterales para guardar lo esencial. Terminado con la marca PUMA blanca y roja en el muslo izquierdo. Lavable en la lavadora. | Nuestro modelo mide 5'9\" y usa una talla mediana.",
      images: ["/product1.jpg", "/product2.jpg"],
      attributes: [{ label: "label", value: "value" }],
      similar: [
        {
          id: "similar-1",
          title: "Puma Pantalones de chandal",
          image: "/similar1.jpg",
        },
        {
          id: "similar-2",
          title: "Puma Pantalones de chandal",
          image: "/similar2.jpg",
        },
      ],
      offers: [
        {
          url: "https://example.com/foo.html",
          price: 10.99,
          currency: "EUR",
          seller: "seller",
          site: {
            name: "site",
            icon: "/shop.ico",
          },
        },
      ],
    },
  },
}
export const Minimal: Story = {
  args: {
    data: {
      title: "Product title",
      brand: null,
      category: null,
      description: null,
      images: null,
      attributes: null,
      similar: null,
      offers: null,
    },
  },
}

export default meta
