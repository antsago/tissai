FROM node:20.11.1 AS base

# Python & poetry
RUN apt update && apt install -y python3 python3-dev
RUN curl -sSL https://install.python-poetry.org | python3 -

# Yarn
RUN bash -ic "corepack enable"

# --- #

FROM base AS build

COPY . /app
WORKDIR /app

# Build svelte
RUN yarn
RUN yarn build

# --- #

FROM base AS final

COPY --from=build /app/{build, package.json, yarn.lock, pyproject.toml, poetry.lock} /app/

WORKDIR /app

# Predownload model
ENV SENTENCE_TRANSFORMERS_HOME=/model
RUN poetry install
RUN poetry run python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

CMD [poetry, run, node, build]


