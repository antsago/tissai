from bs4 import BeautifulSoup
from rdflib import Graph
from rdflib.term import IdentifiedNode
from collections import namedtuple

Predicate = namedtuple('Predicate', ["subject", "subjectType", "predicate", "object", "objectType"])

def getNodeType(node):
  if isinstance(node, IdentifiedNode):
    return "IRI"

  if hasattr(node, "datatype") and node.datatype != None:
    return str(node.datatype)

  return "Value"

def getNodeValue(node):
  if hasattr(node, "value") and node.value != None:
    return node.value

  return str(node)

def parseJsonLd(soup):
  g = Graph()

  ldTags = soup.find_all(name="script", type="application/ld+json")
  [g.parse(data=tag.string, format="json-ld") for tag in ldTags]

  return (Predicate(
      subject=str(s),
      predicate=str(p),
      object=getNodeValue(o),
      subjectType="IRI",
      objectType=getNodeType(o),
  ) for s,p,o in g)

def createPredicates(page):
  soup = BeautifulSoup(page["body"], 'lxml')
  return parseJsonLd(soup)
