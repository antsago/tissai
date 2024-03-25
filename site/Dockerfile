FROM node:20.11.1 AS base

# Python & poetry
RUN apt update && apt install -y python3 python3-dev
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/usr/local python3 -

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

COPY --from=build /app/build /app/build
COPY --from=build /app/.yarn /app/.yarn
COPY --from=build /app/package.json /app/yarn.lock /app/.yarnrc.yml /app/pyproject.toml /app/poetry.lock /app/

WORKDIR /app
RUN yarn workspaces focus --all --production
RUN poetry install --only main

# Predownload model
ENV SENTENCE_TRANSFORMERS_HOME=/model
RUN poetry run python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

CMD ["poetry", "run", "node", "build"]
