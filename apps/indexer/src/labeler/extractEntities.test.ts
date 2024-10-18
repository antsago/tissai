import { describe, test, beforeEach } from "vitest"
import { mockDbFixture, PAGE, queries } from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Tokenizer } from "@tissai/tokenizer"
import { Db } from "@tissai/db"
import { extractEntities } from "./extractEntities.js"

type Fixtures = { db: mockDbFixture; python: mockPythonFixture }

const it = test.extend<Fixtures>({
  db: [mockDbFixture, { auto: true }],
  python: [mockPythonFixture, { auto: true }],
})

describe("extractEntities", () => {
  const FULL_INFO = {
    title: "title",
    brandLogo: "logo",
    brandName: "brand name",
    description: "description",
    images: ["a.jpg"],
    offers: [
      {
        currency: "EUR",
        price: 10,
        seller: "seller",
      },
    ],
  }
  const CATEGORY = "category"
  const ATTRIBUTES = [{ label: "label", value: "value" }]

  let db: Db
  let tokenizer: Tokenizer
  beforeEach<Fixtures>(({ python, db: pg }) => {
    db = Db()
    tokenizer = Tokenizer()

    pg.pool.query.mockResolvedValue({
      rows: [
        {
          name: CATEGORY,
          tally: 1,
          children: [
            {
              name: ATTRIBUTES[0].label,
              tally: 1,
              children: [
                {
                  name: ATTRIBUTES[0].value,
                  tally: 1,
                },
              ],
            },
          ],
        },
      ],
    })
    python.mockReturnValue([{ text: FULL_INFO.title }])
  })

  it("extracts entities", async ({ expect, python, db: pg }) => {
    const result = await extractEntities(FULL_INFO, PAGE, tokenizer, db)

    expect(python.worker.send).toHaveBeenCalledWith(FULL_INFO.title)
    expect(pg).toHaveExecuted(queries.nodes.match([FULL_INFO.title]))
    expect(result).toStrictEqual({
      brand: {
        name: FULL_INFO.brandName,
        logo: FULL_INFO.brandLogo,
      },
      product: {
        id: expect.any(String),
        title: FULL_INFO.title,
        description: FULL_INFO.description,
        images: FULL_INFO.images,
        category: CATEGORY,
        brand: result.brand?.name,
      },
      attributes: [{
        id: expect.any(String),
        product: result.product.id,
        value: ATTRIBUTES[0].value,
      }],
      sellers: [{
        name: FULL_INFO.offers[0].seller,
      }],
      offers: [{
        id: expect.any(String),
        product: result.product.id,
        site: PAGE.site,
        url: PAGE.url,
        price: FULL_INFO.offers[0].price,
        currency: FULL_INFO.offers[0].currency,
        seller: result.sellers[0].name,
      }],
    })
  })

  it("throws if no title", async ({ expect }) => {
    const info = {
      ...FULL_INFO,
      title: undefined,
    }

    const act = extractEntities(info, PAGE, tokenizer, db)

    expect(act).rejects.toThrow()
  })

  it("handles title-only pages", async ({ expect }) => {
    const info = {
      title: FULL_INFO.title,
    }

    const result = await extractEntities(info, PAGE, tokenizer, db)

    expect(result).toStrictEqual({
      brand: undefined,
      offers: [],
      sellers: [],
      product: {
        id: expect.any(String),
        title: info.title,
        description: undefined,
        images: undefined,
        brand: undefined,
        category: CATEGORY,
      },
      attributes: [{
        id: expect.any(String),
        product: result.product.id,
        value: ATTRIBUTES[0].value,
      }],
    })
  })

  it("handles category-only products", async ({ expect, db: pg }) => {
    const info = {
      title: FULL_INFO.title,
    }
    pg.pool.query.mockResolvedValue({
      rows: [
        {
          name: CATEGORY,
          tally: 1,
        },
      ],
    })

    const result = await extractEntities(info, PAGE, tokenizer, db)

    expect(result.product).toStrictEqual(
{
          id: expect.any(String),
          title: info.title,
          description: undefined,
          images: undefined,
          category: CATEGORY,
          brand: undefined,
        }
    )
    expect(result.attributes).toStrictEqual([])
  })

  it("handles titles without interpretation", async ({ expect, db: pg }) => {
    const info = {
      title: FULL_INFO.title,
    }
    pg.pool.query.mockResolvedValue({ rows: [] })

    const result = await extractEntities(info, PAGE, tokenizer, db)

    expect(result).toStrictEqual(
      expect.objectContaining({
        product: {
          id: expect.any(String),
          title: info.title,
          description: undefined,
          images: undefined,
          category: undefined,
          brand: undefined,
        },
        attributes: [],
      }),
    )
  })

  it("normalizes brand name", async ({ expect }) => {
    const info = {
      title: FULL_INFO.title,
      brandName: FULL_INFO.brandName.toUpperCase(),
    }

    const result = await extractEntities(info, PAGE, tokenizer, db)

    expect(result.brand).toStrictEqual({
        name: FULL_INFO.brandName,
        logo: undefined,
      })
    expect(result.product.brand).toStrictEqual(result.brand?.name)
  })

  it("normalizes seller name", async ({ expect }) => {
    const info = {
      title: FULL_INFO.title,
      offers: [
        {
          seller: FULL_INFO.offers[0].seller.toUpperCase(),
        },
      ],
    }

    const result = await extractEntities(info, PAGE, tokenizer, db)

    expect(result.sellers).toStrictEqual([
      { name: FULL_INFO.offers[0].seller },
    ])
    expect(result.offers[0].seller).toStrictEqual(result.sellers[0].name)
  })

  it("removes duplicated offers", async ({ expect }) => {
    const info = {
      title: FULL_INFO.title,
      offers: [FULL_INFO.offers[0], FULL_INFO.offers[0]],
    }

    const result = await extractEntities(info, PAGE, tokenizer, db)

    expect(result.offers.length).toStrictEqual(1)
  })

  it("handles offers without sellers", async ({ expect }) => {
    const info = {
      title: FULL_INFO.title,
      offers: [{
        price: FULL_INFO.offers[0].price,
        currency: FULL_INFO.offers[0].currency,
      }],
    }

    const result = await extractEntities(info, PAGE, tokenizer, db)

    expect(result.offers).toStrictEqual([{
      id: expect.any(String),
      product: result.product.id,
      site: PAGE.site,
      url: PAGE.url,
      seller: undefined,
      price: FULL_INFO.offers[0].price,
      currency: FULL_INFO.offers[0].currency,
    }])
    expect(result.sellers).toStrictEqual([])
  })

  it("handles multiple offers from same seller", async ({ expect }) => {
    const info = {
      title: FULL_INFO.title,
      offers: [FULL_INFO.offers[0], {
        ...FULL_INFO.offers[0],
        price: FULL_INFO.offers[0].price + 1,
      }],
    }

    const result = await extractEntities(info, PAGE, tokenizer, db)

    expect(result.offers.length).toStrictEqual(2)
    expect(result.sellers.length).toStrictEqual(1)
  })
})
