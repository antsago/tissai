import json
from bs4 import BeautifulSoup

def extractJsonLd(soup):
  ldTags = soup.find_all(name="script", type="application/ld+json")
  return [json.loads(tag.string) for tag in ldTags]

class Content:
  def __init__(self, page):
    soup = BeautifulSoup(page["body"], 'lxml')
    self.jsonLd = extractJsonLd(soup)
