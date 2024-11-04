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

type Categorized = {
  category: number,
  matched: string[],
  remaining: string[],
}

function categorize(title: string[], categories: Schema[]): Categorized|undefined {
  for (let [index, category] of categories.entries()) {
    const match = commonWordsBetween(title, category.name)

    if (match.length) {
      const remaining = title.slice(match.length) 

      if (remaining.length && category.categories) {
        const recursiveMatch = categorize(remaining, category.categories)

        if (recursiveMatch) {
          return {
            matched: [...match, ...recursiveMatch.matched],
            category: index,
            remaining: recursiveMatch.remaining, 
          }
        }
      }

      return {
        matched: match,
        category: index,
        remaining, 
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