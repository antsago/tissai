import re
import json
from bs4 import BeautifulSoup

def extractJsonLd(soup):
  ldTags = soup.find_all(name="script", type="application/ld+json")
  return [json.loads(tag.string) for tag in ldTags]

def extractOpengraph(soup):
  ogTags = soup.find_all(name="meta", property=re.compile("^og:"))
  return {tag['property']: tag['content'] for tag in ogTags}

class Content:
  def __init__(self, page):
    soup = BeautifulSoup(page["body"], 'lxml')
    self.jsonLd = extractJsonLd(soup)
    self.opengraph = extractOpengraph(soup)
