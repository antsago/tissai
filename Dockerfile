FROM node:20.18.0 AS base

WORKDIR /tissai

# Python & poetry
RUN apt update && apt install -y python3 python3-dev
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/usr/local python3 -

# Yarn
RUN bash -ic "corepack enable"

# Code
COPY . /tissai

# --- #

FROM base AS build

RUN yarn
RUN yarn site build

# # --- #

FROM base AS final

COPY --from=build /tissai/apps/site/build /tissai/apps/site/build
RUN yarn workspaces focus @tissai/site --production
WORKDIR /tissai/apps/site

# Don't run production as root
# RUN addgroup --system --gid 1001 tissai
# RUN adduser --system --uid 1001 tissai
# USER tissai

CMD ["node", "build"]
