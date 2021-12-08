FROM node:16 as build
WORKDIR /app
COPY --chown=node:node . /app
RUN npm install --silent -g pnpm 
RUN pnpm i --silent && pnpx tsc --project tsconfig.build.json
RUN rm -rf node_modules && pnpm i --silent --production

FROM node:16
COPY --from=build --chown=node:node /app /app
RUN groupmod -g 1003 node && chown node:node /app
USER node
HEALTHCHECK --interval=15s --timeout=5s CMD curl -f http://localhost:8080/api/v1/status || exit 1
ENV NODE_PATH=js/
CMD ["node", "js/main.js"]
