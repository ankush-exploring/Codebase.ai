FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY server/package.json server/tsconfig.json ./server/

FROM base AS deps
WORKDIR /app/server
RUN npm install

FROM deps AS build
WORKDIR /app
COPY server/src ./server/src
RUN cd server && npx tsc

FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser

COPY --from=base /app/tsconfig.base.json ./
COPY --from=base /app/server/package.json ./server/
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=build /app/server/dist ./server/dist

RUN mkdir -p /app/data/repos /app/data/uploads && chown -R appuser:appgroup /app

USER appuser
WORKDIR /app/server
EXPOSE 3001
CMD ["node", "dist/index.js"]
