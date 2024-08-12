import { MatchToken } from "./Filler.js"

const Label = (desiredLabels?: string[]) => 
  MatchToken((nextToken) => {
    if (!nextToken.isMeaningful) {
      return false
    }

    return !desiredLabels || desiredLabels.some((desiredLabel) =>
      nextToken.labels.includes(desiredLabel),
    )
  })

export default Label
