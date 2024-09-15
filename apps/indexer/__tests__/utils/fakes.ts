import { PAGE } from "@tissai/db/mocks"

export { SITE, PAGE, BRAND, PRODUCT, SELLER, OFFER } from "@tissai/db/mocks"

export const pageWithSchema = (...schemas: object[]) => ({
  ...PAGE,
  body: `
    <html>
      <head>
        ${schemas
          .map(
            (schema) => `
          <script type="application/ld+json">
            ${JSON.stringify(schema)}
          </script>
        `,
          )
          .join()}
      </head>
    </html>
  `,
})
