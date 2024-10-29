type Schema = { name: string[], categories?: Schema[] }

function commonWordsFor(a: string[], b: string[]) {
  let common = [] as string[]
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return common
    }

    common = [...common, a[i]]
  }
  
  return common
}

function categoryMatching(words: string[], categories: Schema[]) {
  for (let [index, category] of categories.entries()) {
    const commonWords = commonWordsFor(words, category.name)

    if (commonWords.length) {
      return {
        index,
        category,
        commonWords,
      }
    }
  }
}

export function buildSchema(titles: string[]) {
  let categories = [] as Schema[]

  for (let title of titles) {
    const words = title.split(" ")

    const match = categoryMatching(words, categories)

    if (!match) {
      categories = [...categories, { name: words }]
    } else {
      categories = [{
        name: match.commonWords,
        categories: [
          {
            name: match.category.name.slice(match.commonWords.length),
          },
          {
            name: words.slice(match.commonWords.length),
          },
        ]
      }]
    }
  }

  return categories
}