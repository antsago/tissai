import { restructure } from "../../operators/index.js"
import type {
  ParsedDefinition,
} from "./types.js"
import { IsData } from "./values.js"
import { Property } from "./Property.js"

const IsParsed = <Output>(parse: (text: string) => Output) =>
  restructure(IsData(), async (token) => {
    const parsed = await parse(token as string)
    return { token, parsed }
  })

export const ParsedProperty = ({ key, name, parse }: ParsedDefinition) =>
  restructure(Property(IsParsed(parse.with), name), (values) => [
    {
      key: key,
      value: values.map(({ token }) => token),
    },
    {
      key: parse.as,
      value: values.map(({ parsed }) => parsed),
    },
  ])
