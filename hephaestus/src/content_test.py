from content import Content
from __tests__ import PAGE_ID, pageForTest

productSchema = {
  "@context": { "@vocab": "http://schema.org/" },
  "@type": "Product",
}

def test_parse_json_ld():
  page = pageForTest([productSchema])
  content = Content(page)
  assert [productSchema] == content.jsonLd

def test_parse_opengraph():
  opengraph = {
    "og:type": "product",
    "og:title": "Friend Smash Coin",
  }
  page = {
    "id": PAGE_ID,
    "body": f"""
        <html>
          <head>
            {"".join([f'<meta property="{key}" content="{value}" />' for key, value in opengraph.items()])}
            <script src=\"_ascript\"></script>
          </head>
        </html>
    """,
  }
  content = Content(page)
  assert opengraph == content.opengraph
