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
    const matched = commonWordsBetween(title, category.name)

    if (matched.length) {
      return {
        matched,
        category: index,
        remaining: title.slice(matched.length) 
      }
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

  if (!match.remaining.length) {
    return {}
  }

  return {
    replaceWith: match.category,
    category: {
      name: match.matched,
      categories: [
        {
          name: categories[match.category].name.slice(match.matched.length),
        },
        {
          name: match.remaining,
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