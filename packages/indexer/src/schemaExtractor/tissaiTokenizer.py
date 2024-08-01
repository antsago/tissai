import sys
import json
import spacy

nlp = spacy.load(
    "es_core_news_sm",
    exclude=[
        "tok2vec",
        "morphologizer",
        "parser",
        "attribute_ruler",
        "lemmatizer",
        "ner",
    ],
)

isMeaningful = lambda token: not (
    token.is_stop
    or token.is_punct
    or token.is_space
    or token.is_quote
    or token.is_bracket
    or token.is_digit
    or token.is_currency
    or token.text == "|"
)

for rawQuery in sys.stdin:
    title = json.loads(rawQuery)
    tokens = [token.text for token in nlp(title) if isMeaningful(token)]
    print(json.dumps(tokens, separators=(",", ":")))
