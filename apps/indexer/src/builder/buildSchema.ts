type Schema = { name: string[], categories?: Schema[] }

const commonWordsFor = (a: string[], b: string[]) => {
  let common = [] as string[]
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return common
    }

    common = [...common, a[i]]
  }
  
  return common
}

export function buildSchema(titles: string[]) {
  let categories = [] as Schema[]

  for (let title of titles) {
    const words = title.split(" ")

    let commonWords = [] as string[]
    let commonCategory
    for (let category of categories) {
      commonWords = commonWordsFor(words, category.name)

      if (commonWords.length) {
        commonCategory = category
        break
      }
    }

    if (!commonCategory) {
      categories = [...categories, { name: words }]
    } else {
      categories = [{
        name: commonWords,
        categories: [
          {
            name: commonCategory.name.slice(commonWords.length),
          },
          {
            name: words.slice(commonWords.length),
          },
        ]
      }]
    }
  }

  return categories
}