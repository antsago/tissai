import { MatchToken } from "./Filler.js"

const Label = (desiredLabels?: string[]) => 
  MatchToken((nextToken) => {
    const hasDesiredLabels =
      desiredLabels === undefined
        ? true
        : desiredLabels.some((desiredLabel) =>
            nextToken?.labels.includes(desiredLabel),
          )

    return !!nextToken?.isMeaningful && hasDesiredLabels
  })

export default Label
