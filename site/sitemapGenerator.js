import books from "../data/books.json" assert { type: "json" }

const domain = "https://www.wibnix.com"

console.log(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <lastmod>2023-11-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${Object.keys(books)
  .map(
    (isbn) =>
      `  <url>
    <loc>${domain}/${isbn}</loc>
    <lastmod>2023-11-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`)
