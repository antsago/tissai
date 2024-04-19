import json
from uuid import uuid4 as uuid
from bs4 import BeautifulSoup

def parse(page):
  soup = BeautifulSoup(page, 'lxml')

  ldTags = soup.find_all(name="script", type="application/ld+json")

  return [json.loads(tag.string) for tag in ldTags]

def toProduct(page):
  return [{
    "id": uuid(),
    "title": jsonld["name"],
    "description": jsonld["description"],
    "images": jsonld["image"] if isinstance(jsonld["image"], list) else [jsonld["image"]],
  } for jsonld in page if jsonld["@type"] == "Product"]