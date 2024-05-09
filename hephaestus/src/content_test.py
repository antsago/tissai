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

def test_parse_headings():
  headings = {
    "title": "The page title",
    "description": "The description",
    "keywords": "Some, keywords",
    "author": "The author",
    "robots": "index,follow",
    "canonical": "https://example.com/url1",
  }
  page = {
    "id": PAGE_ID,
    "body": f"""
        <html>
          <head>
            <title>{headings["title"]}</title>
            <meta name="viewport" content="something else">
            <meta name="description" content="{headings["description"]}">
            <meta name='keywords' content='{headings["keywords"]}'>
            <meta name='author' content='{headings["author"]}'>
            <meta name="robots" content="{headings["robots"]}">
            <link rel="canonical" href="{headings["canonical"]}" />
            <script src=\"_ascript\"></script>
          </head>
        </html>
    """,
  }
  content = Content(page)
  assert headings == content.headings
