import { Attribute } from "@tissai/db"

type PartialAttribute = Pick<Attribute, "label" | "value">

const matchLabels = (tokens: string[], attributes: PartialAttribute[]) => {
  const mapping = []
  let match: undefined | ({ tokens: string[] } & PartialAttribute)
  for (const token of tokens) {
    const attribute = attributes.find((a) => a.value === token)

    if (attribute) {
      mapping.push({
        token,
        label: attribute?.label,
      })

      continue
    }

    if (!match) {
      const candidate = attributes.find((a) => a.value.startsWith(token))

      if (!candidate) {
        throw new Error(JSON.stringify({ token, tokens, attributes }))
      }
      match = {
        ...candidate,
        tokens: [token],
      }
      continue
    }

    if (match.value.endsWith(token)) {
      ;[...match.tokens, token].forEach((t) => {
        mapping.push({
          token: t,
          label: match?.label,
        })
      })

      match = undefined
      continue
    }

    if (match.value.includes(token)) {
      match.tokens.push(token)
      continue
    }

    throw new Error(JSON.stringify({ token, tokens, attributes }))
  }

  return mapping
}

export type Token = { text: string; isMeaningful: boolean; trailing: string }
const matchTokens = (tokens: Token[], attributes: Attribute[]) => {
  const mappings = matchLabels(
    tokens.filter((t) => t.isMeaningful).map((t) => t.text),
    attributes,
  )
  let fillerTokens = 0
  const foo = tokens.map((t) => {
    const matched = {
      ...t,
      label: t.isMeaningful ? mappings[fillerTokens].label : undefined,
    }

    if (t.isMeaningful) {
      fillerTokens += 1
    }

    return matched
  })

  return foo
}

function* extractAttributes(tokens: ReturnType<typeof matchTokens>) {
  const words = tokens
    .map((t, i) => ({ ...t, fullIndex: i }))
    .filter((t) => t.isMeaningful)
  const getFragment = (start: number, end: number) => {
    const initialW = words.at(start)
    const finalW = words.at(end)

    const valueTokens = tokens.slice(initialW!.fullIndex, finalW!.fullIndex + 1)

    return {
      label: finalW!.label!,
      tokens: valueTokens,
      value: valueTokens
        .map((t, ind) =>
          ind === valueTokens.length - 1 ? t.text : `${t.text}${t.trailing}`,
        )
        .join(""),
    }
  }

  let yieldFrom = 0
  for (const [index, word] of words.entries()) {
    if (index === 0 || words[index - 1].label === word.label) {
      continue
    }

    yield getFragment(yieldFrom, index - 1)
    yieldFrom = index
  }

  yield getFragment(yieldFrom, words.length - 1)
}

export const tokenizeAttributes = (
  tokens: Token[],
  attributes: Attribute[],
) => {
  const matched = matchTokens(tokens, attributes)
  return [...extractAttributes(matched)]
}

export default matchLabels
