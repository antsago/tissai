from bs4 import BeautifulSoup
from rdflib import Graph

def parseJsonLd(soup):
  g = Graph()

  ldTags = soup.find_all(name="script", type="application/ld+json")
  [g.parse(data=tag.string, format="json-ld") for tag in ldTags]

  return ((str(s), str(p), str(o)) for s,p,o in g)

class Predicates():
  def __init__(self, page):
    self.soup = BeautifulSoup(page["body"], 'lxml')
    self.pageId = page["id"]
    self.jsonLd = parseJsonLd(self.soup)
