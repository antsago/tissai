import { Attribute } from "@tissai/db"

export type Vocabulary = {
  canonical: string
  synonyms: Record<string, number>
  usage: {
    value: number
    label: number
  }
  labels: Record<string, number>
}

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

const normalizeValue = (
  value: string,
  vocabulary: Record<string, Vocabulary>,
) => {
  const baseForm = normalizeString(value)

  if (baseForm in vocabulary) {
    const vocab = vocabulary[baseForm]
    vocab.synonyms[value] =
      value in vocab.synonyms ? vocab.synonyms[value] + 1 : 1
    vocab.usage.value += 1

    if (vocab.synonyms[value] > (vocab.synonyms[vocab.canonical] ?? 0)) {
      vocab.canonical = value
    }
  } else {
    vocabulary[baseForm] = {
      canonical: value,
      synonyms: { [value]: 1 },
      usage: {
        value: 1,
        label: 0,
      },
      labels: {},
    }
  }

  return baseForm
}

const normalizeLabel = (
  label: string,
  vocabulary: Record<string, Vocabulary>,
) => {
  const baseForm = normalizeString(label)

  if (baseForm in vocabulary) {
    vocabulary[baseForm].usage.label += 1
  } else {
    vocabulary[baseForm] = {
      canonical: label,
      synonyms: {},
      usage: {
        value: 0,
        label: 1,
      },
      labels: {},
    }
  }

  return baseForm
}

function normalize(
  attributes: Attribute[],
  vocabulary: Record<string, Vocabulary>,
) {
  const normalized = attributes.map((a) => ({
    ...a,
    label: normalizeLabel(a.label, vocabulary),
    value: normalizeValue(a.value, vocabulary),
  }))

  normalized.forEach(
    (a) =>
      (vocabulary[a.value].labels[a.label] =
        1 + (vocabulary[a.value].labels[a.label] ?? 0)),
  )

  return normalized
}

export default normalize
