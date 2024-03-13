# from sentence_transformers import SentenceTransformer
# model = SentenceTransformer('all-MiniLM-L6-v2')
# embedding = model.encode(['Hola mundo'])[0]
# print(embedding)

# import torch
# x = torch.rand(5, 3)
# print(x)

# from transformers import pipeline
# classifier = pipeline('sentiment-analysis')
# print(classifier('We are very happy to introduce pipeline to the transformers repository.'))

# import numpy as np
# a = np.arange(6)
# a2 = a[np.newaxis, :]
# print(a2.shape)

# import requests
# r = requests.get('https://api.spotify.com/')
# print(r.status_code)

from rake_nltk import Rake

# Uses stopwords for english from NLTK, and all puntuation characters by
# default
r = Rake()
# Extraction given the text.
r.extract_keywords_from_text('RAKE short for Rapid Automatic Keyword Extraction algorithm, is a domain independent keyword extraction algorithm which tries to determine key phrases in a body of text by analyzing the frequency of word appearance and its co-occurance with other words in the text.')
print(r.get_ranked_phrases())
