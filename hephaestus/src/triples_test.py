import json
from asymmetric_matchers import string_matching, list_containing, anything
from triples import createTriples, Triple

PAGE_ID = "test-id"
pageForTest = lambda schemas: {
    "id": PAGE_ID,
    "body": f"""
        <html>
          <head>
            {"".join([f'<script type="application/ld+json">{json.dumps(schema)}</script>' for schema in schemas])}
            <script src=\"_ascript\"></script>
          </head>
        </html>
    """,
}
tripleForTest = lambda predicate, object, objectType = "IRI": Triple(
    id=anything(),
    page=PAGE_ID,
    subject=string_matching(".*"),
    subjectType="IRI",
    predicate=predicate,
    object=object,
    objectType=objectType,
)
productSchema = {
  "@context": { "@vocab": "http://schema.org/" },
  "@type": "Product",
}
productTriples = [
    tripleForTest('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Product'),
]

def test_json_ld():
    page = pageForTest([productSchema])
    triples = createTriples(page)
    assert list_containing(productTriples) == list(triples)

def test_multiple_json_ld():
    page = pageForTest([
        productSchema,
        {
            "@context": { "@vocab": "http://schema.org/" },
            '@type': 'Organization',
        }])
    triples = createTriples(page)
    assert list_containing([
        *productTriples,
        tripleForTest('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Organization'),
    ]) == list(triples)

def test_empty_pages():
    page = pageForTest([])
    triples = createTriples(page)
    assert [] == list(triples)

def test_non_string_json_ld():
    page = pageForTest([{
        "@context":{
            "@vocab": "http://schema.org/",
            "validFrom": { "@type": "Date"},
        },
        "seller":{
            "@type":"Organization",
        },
        "isFamilyFriendly": False,
        "itemCondition":"https://schema.org/NewCondition",
        "price":24.99,
        "validFrom": "2011-04-01"
    }])

    triples = createTriples(page)

    assert list_containing([
        tripleForTest('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Organization'),
        tripleForTest("http://schema.org/isFamilyFriendly", False, "http://www.w3.org/2001/XMLSchema#boolean"),
        tripleForTest("http://schema.org/itemCondition", "https://schema.org/NewCondition", "Value"),
        tripleForTest("http://schema.org/price", 24.99, "http://www.w3.org/2001/XMLSchema#double"),
        tripleForTest("http://schema.org/seller", string_matching(".*"), "IRI"),
        tripleForTest("http://schema.org/validFrom", "2011-04-01", "http://schema.org/Date"),
        tripleForTest("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://schema.org/Organization"),
    ]) == list(triples)
