export const getSuggestions = async (query: string, locals: App.Locals) => {
  const words = (await locals.tokenizer.fromText(query)).filter(w => !!w.isMeaningful).map(w => w.text)
  const suggestion = await locals.db.suggestions.category(words)

  return [{ ...suggestion, frequency: 1 }]
}
