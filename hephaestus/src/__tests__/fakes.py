import json

productSchema = {
  "@context": { "@vocab": "http://schema.org/" },
  "@type": "Product",
  "name": "The name of the product",
  "description": "The description in ld",
  "image": "https://image.com/png",
}
orgSchema = {
  "@context": { "@vocab": "http://schema.org/" },
  '@type': 'Organization',
  'name': 'Algo Bonito',
  'logo': 'https://algo-bonito.com/LogoFondoTrans_1024_1024x.png',
  'url': 'https://algo-bonito.com'
}
pageForTest = lambda schemas: {
    "id": "test-id",
    "body": f"""
        <html>
          <head>
            {"".join([f'<script type="application/ld+json">{json.dumps(schema)}</script>' for schema in schemas])}
            <script src=\"_ascript\"></script>
          </head>
        </html>
    """,
}
product = {
  "id": "page-id",
  "title": "the product name",
  "description": "the product name",
  "images": "the product name",
}
