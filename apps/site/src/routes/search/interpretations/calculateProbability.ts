import { type Interpretation } from "./normalize.js"

export function calculateProbability({ category, properties }: Interpretation) {
  const multiply = (a: number, b: number) => a * b
  return properties
    .map(({ value, label }) =>
      value !== undefined
        ? value.tally / category.tally
        : (category.tally - label.tally) / category.tally,
    )
    .reduce(multiply, category.tally)
}
