function parseSearchParams(params: URLSearchParams) {
  return {
    query: params.get("q") || "",
    brand: params.get("brand"),
    category: params.get("category"),
    tags: params.getAll("inc"),
    min: params.getAll("min").map((m) => parseFloat(m))[0],
    max: params.getAll("max").map((m) => parseFloat(m))[0],
  }
}

export default parseSearchParams
