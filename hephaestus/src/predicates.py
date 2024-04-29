from bs4 import BeautifulSoup
from rdflib import Graph
from rdflib.term import IdentifiedNode
from collections import namedtuple

Predicate = namedtuple('Predicate', ["subject", "subjectType", "predicate", "object", "objectType"])

def parseJsonLd(soup):
  g = Graph()

  ldTags = soup.find_all(name="script", type="application/ld+json")
  [g.parse(data=tag.string, format="json-ld") for tag in ldTags]

  return (Predicate(
      subject=str(s),
      predicate=str(p),
      object=getattr(o, "value", None) or str(o),
      subjectType="IRI",
      objectType="IRI" if isinstance(o, IdentifiedNode) else str(getattr(o, "datatype", None) or "Value"),
  ) for s,p,o in g)

class Predicates():
  def __init__(self, page):
    self.soup = BeautifulSoup(page["body"], 'lxml')
    self.pageId = page["id"]
    self.jsonLd = parseJsonLd(self.soup)
