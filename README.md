# tangledrip

## Dev env

We use nix and devcontainers. Run a shell in the image defined by .devcontainer/Dockerfile and then run the command commented at the end of the Dockerfile to start a shell with the dependencies

## Data generation

To pull data from the NYT booksellers api:

- Create an empty /data folder
- Inside /dataGenerator
  - Create a .env with the API_KEY env variable for NYT
  - Run `yarn books` to retrieve the books
  - Run `yarn relationships` to create the relationships between books
