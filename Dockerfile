FROM node:20.11.1 AS base

# Yarn
RUN bash -ic "corepack enable"

WORKDIR /app

# --- #

FROM base AS build

COPY . /app

# Build svelte
RUN yarn
RUN yarn site build

# --- #

FROM base AS final

COPY --from=build /app/package.json /app/yarn.lock /app/.yarnrc.yml /app/
COPY --from=build /app/packages/db/package.json /app/packages/db/
COPY --from=build /app/packages/site/package.json /app/packages/site/
COPY --from=build /app/packages/site/build /app/packages/site/build

RUN yarn workspaces focus @tissai/site --production
WORKDIR /app/packages/site

CMD ["node", "build"]
