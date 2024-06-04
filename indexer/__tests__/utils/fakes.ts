import { PAGE, CATEGORY, TAG, PRODUCT } from "@tissai/db/mocks"

export {
  SITE,
  PAGE,
  BRAND,
  CATEGORY,
  TAG,
  PRODUCT,
  SELLER,
  OFFER,
} from "@tissai/db/mocks"

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

export const DERIVED_DATA = {
  category: CATEGORY.name,
  tags: [TAG.name],
  embedding: PRODUCT.embedding,
}
