import { Tokenizer } from "@tissai/tokenizer"

export async function getAttributes(title: string) {
  const tokenizer = Tokenizer()
  const words = await tokenizer.fromText(title)
  return words.filter(w => !!w.isMeaningful).map(w => w.text)
}
