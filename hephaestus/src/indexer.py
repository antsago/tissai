import json
from bs4 import BeautifulSoup

def parse(page):
  soup = BeautifulSoup(page, 'lxml')

  jsonString = soup.find_all(name="script", type="application/ld+json")[0].string
  linkedData = json.loads(jsonString)

  return linkedData