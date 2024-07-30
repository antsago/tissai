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


def getTags(title, verbatim=False):
    doc = nlp(title)

    if verbatim:
        return [token for token in doc if isMeaningful(token)]

    return list({token.lower_ for token in doc if isMeaningful(token)})
