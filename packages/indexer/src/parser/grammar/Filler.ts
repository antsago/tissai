import { MatchToken } from "../operators/index.js"

const Filler = MatchToken((nextToken) => !nextToken.isMeaningful)

export default Filler
