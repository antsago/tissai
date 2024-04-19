import json
from uuid import uuid4 as uuid
from bs4 import BeautifulSoup

def parse(page):
  soup = BeautifulSoup(page, 'lxml')

  ldTags = soup.find_all(name="script", type="application/ld+json")

  if (len(ldTags) == 0):
    return None

  jsonString = ldTags[0].string
  linkedData = json.loads(jsonString)

  return linkedData

def toProduct(data):
  return {
    "id": uuid(),
    "title": data["name"],
    "description": data["description"],
    "images": [data["image"]],
  }