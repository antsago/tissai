# tangledrip

## Dev env
We use nix and devcontainers. Run a shell in the image defined by .devcontainer/Dockerfile and then run the command commented at the end of the Dockerfile to start a shell with the dependencies

## Data generation
To pull data from the NYT booksellers api:
- Create an empty /data folder
- Create a /dataGenerator/.env with API_KEY set appropriately
- Run `yarn start` inside /dataGenerator

## Other

To generate embeddings you need SentenceTransformers, to install the required dependencies use NixOs and run `nix-shell -p python311Packages.sentence-transformers`

Then in the root folder:
- Create a .env with the API_KEY env variable for NYT
- Run `yarn books` to retrieve the books 
- Run `yarn relationships` to create the relationships between books
