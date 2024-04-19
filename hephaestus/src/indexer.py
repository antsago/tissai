from uuid import uuid4 as uuid
from page import Page

def toProduct(page):
  return [{
    "id": uuid(),
    "title": jsonld["name"],
    "description": jsonld["description"],
    "images": jsonld["image"] if isinstance(jsonld["image"], list) else [jsonld["image"]],
  } for jsonld in page if jsonld["@type"] == "Product"]