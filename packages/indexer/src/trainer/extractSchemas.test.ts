import { expect, describe, it } from "vitest"
import { type Token} from "../parser/index.js"

function extractSchemas(category: string, properties: (Token & { labels?: string[] })[]) {
  return [{
    category,
    label: properties[0].labels?.[0],
    value: properties[0].text,
    tally: 1,
  }]
}

describe("extractSchemas", () => {
  const CATEGORY = "myCategory"
  const WORD_TOKEN = {
    text: "word",
    originalText: "word",
    isMeaningful: true,
    trailing: "",
  }

  it("converts labels to schema", () => {
    const LABEL = "foo"
    const properties = [{...WORD_TOKEN, labels: [LABEL]}]

    const result = extractSchemas(CATEGORY, properties)

    expect(result).toStrictEqual([{
      category: CATEGORY,
      label: LABEL,
      value: WORD_TOKEN.text,
      tally: 1,
    }])
  })
})
