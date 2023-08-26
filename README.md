# tangledrip

To generate embeddings you need SentenceTransformers, to install the required dependencies use NixOs and run `nix-shell -p python311Packages.sentence-transformers`

Then in the root folder:
- Create a .env with the API_KEY env variable for NYT
- Run `yarn books` to retrieve the books 
- Run `yarn relationships` to create the relationships between books
