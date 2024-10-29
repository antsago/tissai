FROM node:20.18.0 AS base

# Python & poetry
RUN apt update && apt install -y python3 python3-dev
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/usr/local python3 -

# Yarn
RUN bash -ic "corepack enable"

# Code
WORKDIR /tissai
COPY . /tissai

# --- #

FROM base AS build

RUN yarn
RUN yarn build --filter=@tissai/site

# --- #

FROM base AS final

COPY --from=build /tissai/apps/site/build /tissai/apps/site/build
COPY --from=build /tissai/packages/db/build /tissai/packages/db/build
COPY --from=build /tissai/packages/python-pool/build /tissai/packages/python-pool/build
COPY --from=build /tissai/packages/tokenizer/build /tissai/packages/tokenizer/build
RUN yarn workspaces focus @tissai/site --production

WORKDIR /tissai/apps/site
CMD ["node", "build"]
