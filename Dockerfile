FROM node:22-alpine AS build
WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM node:22-alpine AS final
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /src/dist/teamTracker ./dist/teamTracker

EXPOSE 4000

USER node
CMD ["node", "dist/teamTracker/server/server.mjs"]
