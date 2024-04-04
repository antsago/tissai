import spacy
from spacy import displacy
from products import products

nlp = spacy.load('es_core_news_sm')
# nlp = es_core_news_sm.load(exclude=['morphologizer', 'parser', 'attribute_ruler', 'lemmatizer', 'ner'])
doc = nlp(products[27]['name'])
displacy.serve(doc, style="dep", port=5002)

# print([token.text for token in doc if not (token.is_stop or token.is_punct)])
# print(nlp.pipe_names)

# import spacy

# nlp = spacy.load("en_core_web_md")  # make sure to use larger package!
# doc1 = nlp("I like salty fries and hamburgers.")
# doc2 = nlp("Fast food tastes very good.")

# # Similarity of two documents
# print(doc1, "<->", doc2, doc1.similarity(doc2))
# # Similarity of tokens and spans
# french_fries = doc1[2:4]
# burgers = doc1[5]
# print(french_fries, "<->", burgers, french_fries.similarity(burgers))
