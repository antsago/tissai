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

export default matchLabels
