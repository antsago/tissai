from bs4 import BeautifulSoup
from rdflib import Graph
from rdflib.term import IdentifiedNode
from dataclasses import dataclass
from typing import Union

@dataclass
class Predicate:
  page: str
  subject: Union[str, bool, None, int, float]
  subjectType: str
  predicate: str
  object: Union[str, bool, None, int, float]
  objectType: str

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

def createPredicates(page):
  soup = BeautifulSoup(page["body"], 'lxml')
  ldTags = soup.find_all(name="script", type="application/ld+json")

  g = Graph()
  [g.parse(data=tag.string, format="json-ld") for tag in ldTags]

  return (Predicate(
      page=page["id"],
      subject=str(s),
      predicate=str(p),
      object=getNodeValue(o),
      subjectType="IRI",
      objectType=getNodeType(o),
  ) for s,p,o in g)
