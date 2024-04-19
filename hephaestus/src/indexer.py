import json
from uuid import uuid4 as uuid
from bs4 import BeautifulSoup

def parse(page):
  soup = BeautifulSoup(page, 'lxml')

  ldTags = soup.find_all(name="script", type="application/ld+json")

  return [json.loads(tag.string) for tag in ldTags]

def toProduct(dataArry):
  productLd = [data for data in dataArry if data["@type"] == "Product"][0]

  return {
    "id": uuid(),
    "title": productLd["name"],
    "description": productLd["description"],
    "images": [productLd["image"]],
  }