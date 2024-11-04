type Schema = { name: string[], categories?: Schema[] }

function commonWordsBetween(a: string[], b: string[]) {
  let common = [] as string[]
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return common
    }

    common = [...common, a[i]]
  }
  
  return common
}

function categorize(title: string[], categories: Schema[]) {
  for (let [index, category] of categories.entries()) {
    const commonWords = commonWordsBetween(title, category.name)

    if (commonWords.length) {
      return { commonWords, index }
    }
  }
}

function createCategory(title: string[], categories: Schema[]) {
  const match = categorize(title, categories)

  if(!match) {
    return {
      category: { name: title },
    }
  }

  if (match.commonWords.length === title.length) {
    return {}
  }

  return {
    replaceWith: match.index,
    category: {
      name: match.commonWords,
      categories: [
        {
          name: categories[match.index].name.slice(match.commonWords.length),
        },
        {
          name: title.slice(match.commonWords.length),
        },
      ]
    },
  }
}

export function buildSchema(titles: string[]) {
  let categories = [] as Schema[]

  for (let title of titles) {
    const words = title.split(" ")

    const { category, replaceWith } = createCategory(words, categories)

    categories = replaceWith === undefined
      ? category === undefined
        ? categories
        : [...categories, category]
      : categories.toSpliced(replaceWith, 1, category)
  }

  return categories
}