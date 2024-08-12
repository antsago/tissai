import { MatchToken } from "./Filler.js"

const Label = (desiredLabels?: string[]) =>
  MatchToken(
    (nextToken) =>
      nextToken.isMeaningful &&
      (!desiredLabels ||
        desiredLabels.some((desiredLabel) =>
          nextToken.labels.includes(desiredLabel),
        )),
  )

export default Label
