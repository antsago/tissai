[![Open in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Container&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/antsago/Tissai)

# Tissai

Tissai is an attempt at creating a more interactive product search engine (like google products). You can see it in action at [www.tissai.com](https://www.tissai.com/)

The project is made up of two services:

- **The site**: which is what the end user interacts with to search through the database of indexed products. It's made in SvelteKit and PostgreSQL. The search algorithm matches the user's query with the indexed titles and filters the results based on a set of filters that are infered from the query using a bayesian network of product categories and properties.
- **The indexer**: which is the core differentiator of Tissai as a product search engine. It's also the least mature and that is reflected in the low cohesion of its responsabilities and file structure. It's main job is to provide the site with a network of product categories and a database of products indexed according to it.
  - The bayesian network is created by processing the product titles using an LLM
  - the product data is obtained with the JSONLD extracted from a database of crawled product pages and the product titles matched with the bayesian network to identify it's categories and other properties
  - No code is responsible for crawling at the moment; the deployed demo uses an old dataset crawled very early on in the project life.

The project has been developed using a devcontainer that provides the necessary tooling. If using vscode, clicking the tag above should clone the repository, and start the development containers; running `yarn` should install the python and javascript dependencies, and then you should be ready to run the scripts in the various package.json.
