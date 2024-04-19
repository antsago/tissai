import json
from page import Page

product = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "The name of the product",
  "description": "The description in ld",
  "image": "https//image.com/png",
}
org = {
  '@context': 'http://schema.org',
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

def test_extracts_json_ld():
    rawPage = pageForTest([product])

    page = Page(rawPage)

    assert page.jsonLd == [product]

def test_extracts_multiple_json_ld():
    rawPage = pageForTest([product, org])

    page = Page(rawPage)

    assert page.jsonLd == [product, org]

def test_ignores_empty_pages():
    rawPage = pageForTest([])

    page = Page(rawPage)

    assert page.jsonLd == []
