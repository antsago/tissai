import json
from asymmetric_matchers import string_matching, list_containing
from predicates import createPredicates, Predicate

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
predForTest = lambda predicate, object, objectType = "IRI": Predicate(
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
orgSchema = {
  "@context": { "@vocab": "http://schema.org/" },
  '@type': 'Organization',
}
productPredicates = [
    predForTest('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Product'),
]
orgPredicates = [
    predForTest('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Organization'),
]

def test_json_ld():
    rawPage = pageForTest([productSchema])
    predicates = createPredicates(rawPage)
    assert list_containing(productPredicates) == list(predicates)

def test_multiple_json_ld():
    rawPage = pageForTest([productSchema, orgSchema])
    predicates = createPredicates(rawPage)
    assert list_containing([*productPredicates, *orgPredicates]) == list(predicates)

def test_empty_pages():
    rawPage = pageForTest([])
    predicates = createPredicates(rawPage)
    assert [] == list(predicates)

def test_non_string_json_ld():
    rawPage = pageForTest([{
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

    predicates = createPredicates(rawPage)

    assert list_containing([
        predForTest('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Organization'),
        predForTest("http://schema.org/isFamilyFriendly", False, "http://www.w3.org/2001/XMLSchema#boolean"),
        predForTest("http://schema.org/itemCondition", "https://schema.org/NewCondition", "Value"),
        predForTest("http://schema.org/price", 24.99, "http://www.w3.org/2001/XMLSchema#double"),
        predForTest("http://schema.org/seller", string_matching(".*"), "IRI"),
        predForTest("http://schema.org/validFrom", "2011-04-01", "http://schema.org/Date"),
        predForTest("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://schema.org/Organization"),
    ]) == list(predicates)
