from bs4 import BeautifulSoup
from rdflib import Graph
from rdflib.term import IdentifiedNode
from collections import namedtuple

Predicate = namedtuple('Predicate', ["subject", "subjectType", "predicate", "object", "objectType"])

def getNodeType(node):
  if isinstance(node, IdentifiedNode):
    return "IRI"

  if not hasattr(node, "datatype") or node.datatype == None:
    return "Value"
  
  return str(node.datatype)

def parseJsonLd(soup):
  g = Graph()

  ldTags = soup.find_all(name="script", type="application/ld+json")
  [g.parse(data=tag.string, format="json-ld") for tag in ldTags]

  return (Predicate(
      subject=str(s),
      predicate=str(p),
      object=getattr(o, "value", None) or str(o),
      subjectType="IRI",
      objectType=getNodeType(o),
  ) for s,p,o in g)

class Predicates():
  def __init__(self, page):
    self.soup = BeautifulSoup(page["body"], 'lxml')
    self.pageId = page["id"]
    self.jsonLd = parseJsonLd(self.soup)
