import { infer } from "@tissai/tokenizer"

export async function inferFilters(query: string, locals: App.Locals) {
  const words = await locals.tokenizer.fromText(query)
  const infered = await infer(
    words.filter((w) => w.isMeaningful).map((w) => w.text),
    locals.db,
  )

  if (!infered.category) {
    return {}
  }

  return {
    category: {
      label: "categoría",
      id: infered.category.id,
      name: infered.category.name,
    },
    attributes: infered.attributes.map((att) => ({
      name: att.value.name,
      label: att.label.name,
      id: att.value.id,
    })),
  }
}
