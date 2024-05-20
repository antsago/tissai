import sys
import json
import spacy
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

nlp = spacy.load(
    "es_core_news_sm",
    exclude=["morphologizer", "parser", "attribute_ruler", "lemmatizer", "ner"],
)

isMeaningless = lambda token: not (
    token.is_stop
    or token.is_punct
    or token.is_space
    or token.is_quote
    or token.is_bracket
    or token.is_digit
    or token.is_currency
    or token.text == "|"
)

for query in sys.stdin:
  title = json.loads(query)
  embedding = model.encode([title], convert_to_numpy=True)[0].tolist()
  doc = nlp(title)
  tags = list({token.lower_ for token in doc[1:] if isMeaningless(token)})
  category = doc[0].lower_
  print(json.dumps({
    "embedding": embedding,
    "category": category,
    "tags": tags,
  }, separators=(',', ':')))
