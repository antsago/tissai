FROM node:20.11.1 AS base

# Python & poetry
RUN apt update && apt install -y python3 python3-dev
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/usr/local python3 -

# Yarn
RUN bash -ic "corepack enable"

WORKDIR /app

# --- #

FROM base AS build

COPY . /app

# Build svelte
RUN yarn
RUN yarn site build
RUN cp packages/site/src/lib/server/Embedder/embedder.py packages/site/build/server/chunks/embedder.py

# --- #

FROM base AS final

COPY --from=build /app/package.json /app/yarn.lock /app/.yarnrc.yml /app/
COPY --from=build \
  /app/packages/site/build /app/packages/site/packages.json \
  /app/packages/site/pyproject.toml /app/packages/site/poetry.lock \
  /app/packages/site/

RUN yarn workspaces focus --all --production
WORKDIR /app/packages/site
RUN poetry install --only main

# Predownload model
ENV SENTENCE_TRANSFORMERS_HOME=/model
RUN poetry run python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

CMD ["poetry", "run", "node", "build"]
