import type { Preview } from "@storybook/svelte"
import "../src/app.css"

const height = "90vh"

const preview: Preview = {
  parameters: {
    viewport: {
      options: {
        mobileS: {
          name: "Mobile S",
          type: "mobile",
          styles: {
            width: "320px",
            height,
          },
        },
        mobileM: {
          name: "Mobile M",
          type: "mobile",
          styles: {
            width: "375px",
            height,
          },
        },
        mobileL: {
          name: "Mobile L",
          type: "mobile",
          styles: {
            width: "425px",
            height,
          },
        },
        tablet: {
          name: "Tablet",
          type: "tablet",
          styles: {
            width: "768px",
            height,
          },
        },
        laptop: {
          name: "Laptop",
          type: "desktop",
          styles: {
            width: "1024px",
            height,
          },
        },
        laptopL: {
          name: "Laptop L",
          type: "desktop",
          styles: {
            width: "1440px",
            height,
          },
        },
      },
    },
    backgrounds: {
      options: {
        stone50: { name: "Stone 50", value: "#fafaf9" },
        stone100: { name: "Stone 100", value: "#f5f5f4" },
        stone200: { name: "Stone 200", value: "#e7e5e4" },
      },
    },
  },
  initialGlobals: {
    viewport: { value: "mobileS", isRotated: false },
    backgrounds: { value: "stone100" },
  },
}

export default preview
