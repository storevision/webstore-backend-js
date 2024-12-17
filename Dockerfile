FROM node:22-alpine AS base

FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat g++ make py3-pip jpeg-dev cairo-dev giflib-dev pango-dev libtool autoconf automake
RUN yarn global add node-gyp

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS runner

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY tsconfig.json package.json yarn.lock ./

COPY src ./src

COPY sql ./sql

COPY assets ./assets

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs

RUN adduser --system --uid 1001 nodejs

USER nodejs

EXPOSE 3000

CMD ["yarn", "start"]
