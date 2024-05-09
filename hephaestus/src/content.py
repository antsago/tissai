import re
import json
from bs4 import BeautifulSoup

def extractJsonLd(soup):
  ldTags = soup.find_all(name="script", type="application/ld+json")
  return [json.loads(tag.string) for tag in ldTags]

def extractOpengraph(soup):
  ogTags = soup.find_all(name="meta", property=re.compile("^og:"))
  return {tag['property']: tag['content'] for tag in ogTags}


def extractHeadings(soup):
  title = soup.head.title
  description = soup.find("meta", {"name": "description"})
  keywords = soup.find("meta", {"name": "keywords"})
  author = soup.find("meta", {"name": "author"})
  robots = soup.find("meta", {"name": "robots"})
  canonical = soup.find(name="link", rel="canonical")

  return {
    "title": title.string if title != None else None,
    "description": description["content"] if description != None else None,
    "keywords": keywords["content"] if keywords != None else None,
    "author": author["content"] if author != None else None,
    "robots": robots["content"] if robots != None else None,
    "canonical": canonical["href"] if canonical != None else None,
  }

class Content:
  def __init__(self, page):
    soup = BeautifulSoup(page["body"], 'lxml')
    self.jsonLd = extractJsonLd(soup)
    self.opengraph = extractOpengraph(soup)
    self.headings = extractHeadings(soup)
