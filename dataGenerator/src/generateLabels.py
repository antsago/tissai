from Labeler import Labeler
from products import products
from collections import Counter
from functools import reduce


def countLabels(count, product):
    count.update(Labeler(product["name"]).getLabels())
    return count


count = reduce(countLabels, products, Counter())
