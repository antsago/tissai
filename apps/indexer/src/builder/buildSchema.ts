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

function createCategory(title: string[], categories: Schema[]) {
  for (let [index, category] of categories.entries()) {
    const commonWords = commonWordsFor(title, category.name)

    if (commonWords.length) {
      return {
        replaceWith: index,
        category: {
          name: commonWords,
          categories: [
            {
              name: category.name.slice(commonWords.length),
            },
            {
              name: title.slice(commonWords.length),
            },
          ]
        },
      }
    }
  }

  // No match, completely new category
  return {
    category: { name: title },
  }
}

export function buildSchema(titles: string[]) {
  let categories = [] as Schema[]

  for (let title of titles) {
    const words = title.split(" ")

    const { category, replaceWith } = createCategory(words, categories)

    categories = replaceWith === undefined
      ? [...categories, category]
      : categories.toSpliced(replaceWith, 1, category)
  }

  return categories
}