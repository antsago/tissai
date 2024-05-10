from Labeler import Labeler
from collections import Counter
from functools import reduce


def addLabels(count, product):
    count.update(Labeler(product["name"]).getLabels())
    return count

def countLabels(products):
    count = reduce(addLabels, products, Counter())
    return count

def addCategories(categories, product):
    if product["category"] not in categories:
        categories[product["category"]] = { "products": [], "labels": Counter() }
    categories[product["category"]]["products"].append(product)
    categories[product["category"]]["labels"].update(product["labels"])
    return categories

def countCategories(products):
    labels = [Labeler(product["name"]) for product in products]
    categorized = [{ **product, "category": label.getCategory(), "labels": label.getLabels()} for (product, label) in zip(products, labels)]
    categories = reduce(addCategories, categorized, {})
    return categories
