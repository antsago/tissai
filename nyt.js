const API_KEY = ""

const main = async () => {
  const response = await fetch(
    `https://api.nytimes.com/svc/books/v3/lists/full-overview.json?api-key=${API_KEY}&published_date=2023-08-21`,
  )
  const body = await response.json()
  console.log(JSON.stringify(body))
}

main()
