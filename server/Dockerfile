# This dockerfile spins up an instance of tachi-server and *tachi-server* alone.
# It does not spin up mongodb instances or redis instances, which the server
# does need to boot. You should consider using docker-compose for this.

FROM node:16 as build
WORKDIR /app
COPY --chown=node:node . /app
RUN npm install --silent -g pnpm@6 && groupmod -g 1003 node && chown node:node /app
USER node
RUN pnpm install --silent --frozen-lockfile && pnpm build && pnpm prune --silent --production && pnpm store prune --silent
HEALTHCHECK --interval=15s --timeout=5s CMD curl -f http://localhost:8080/api/v1/status || exit 1
ENV NODE_PATH=js/
CMD ["node", "js/server/src/main.js"]
