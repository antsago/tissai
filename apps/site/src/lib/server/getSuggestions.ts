export const getSuggestions = async (locals: App.Locals) => {
  const suggestion = await locals.db.suggestions.category()

  if (!suggestion.values?.length) {
    return []
  }

  return [{ ...suggestion }]
}
