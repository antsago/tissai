from content import Content
from __tests__ import pageForTest

productSchema = {
  "@context": { "@vocab": "http://schema.org/" },
  "@type": "Product",
}

def test_parse_json_ld():
  page = pageForTest([productSchema])
  content = Content(page)
  assert [
    {
      "@context": { "@vocab": "http://schema.org/" },
      "@type": "Product",
    }
  ] == content.jsonLd
