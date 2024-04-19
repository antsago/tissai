import json
from bs4 import BeautifulSoup

class Page():
  def __init__(self, page):
    self.soup = BeautifulSoup(page["body"], 'lxml')

  @property
  def jsonLd(self):
    ldTags = self.soup.find_all(name="script", type="application/ld+json")
    return [json.loads(tag.string) for tag in ldTags]
