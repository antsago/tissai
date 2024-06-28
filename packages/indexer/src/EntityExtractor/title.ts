import type { JsonLD } from "../jsonLd.js"
import type { OpenGraph } from "../opengraph.js"
import type { Headings } from "../headings.js"

function title(jsonLd: JsonLD, og: OpenGraph, head: Headings) {
  return jsonLd.title ?? og.title ?? head.title
}

export default title
