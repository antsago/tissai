from uuid import uuid4 as uuid

def toProduct(page):
  return [{
    "id": uuid(),
    "title": jsonld["name"],
    "description": jsonld["description"],
    "images": jsonld["image"] if isinstance(jsonld["image"], list) else [jsonld["image"]],
    "page": page.id,
  } for jsonld in page.jsonLd if jsonld["@type"] == "Product"]